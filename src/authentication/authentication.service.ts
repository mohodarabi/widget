import { Injectable, NotFoundException, UnauthorizedException, BadRequestException } from '@nestjs/common'
import { UserService } from '../users/users.service'
import RegisterDto from './dtos/register.dto'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import TokenPayload from './interface/tokenPayload.interface'
import TokenType from './interface/tokenPayload.enum'
import * as bcrypt from 'bcrypt';
import { InjectBot } from 'nestjs-telegraf'
import { Context } from 'telegraf'
import { from } from 'form-data'
import { WidgetService } from 'src/widget/widget.service'
import * as generator from 'generate-password';
import { EmailConfirmationService } from './../emailConfirmation/emailConfirmation.service'


@Injectable()
export class AuthenticationService {

  constructor(
    private readonly usersService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly widgetService: WidgetService,
    private readonly emailConfirmationService: EmailConfirmationService,
    @InjectBot() private bot: Context
  ) { }

  public async signup(data: RegisterDto) {
    const { email, password, playerId } = data;

    if (!email || !password || !playerId) throw new BadRequestException('all credentials are required');

    const emailRgx = new RegExp(/^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/);

    if (!emailRgx.test(email) || password.length <= 6) throw new BadRequestException('invalid email or password');

    let user = await this.usersService.findByEmail(email);

    if (user && user.isVerified) throw new BadRequestException('user already registered');

    const code = new Date().getTime().toString()
    const username = email.split('@')[0]
    let newPassword = await bcrypt.hash(password, 12);
    user = await this.usersService.create({
      email,
      password: newPassword,
      username,
      isVerified: true,
      editedUsername: username.toLowerCase(),
      code,
      profileImage: `logo${Math.floor(Math.random() * 8) + 1}.png`,
      playerId
    });
    const accessToken = this.getAccessToken(user.id)
    await this.bot.telegram.sendMessage(this.configService.get<string>('CHANNEL_ID'), `🤝\n${user.username} is successfully signed up\ntotal widgets: ${user.widgets}`)

    return {
      user: user,
      accessToken
    }
  }

  public async login(data: RegisterDto) {
    const { email, password, playerId } = data;

    if (!email || !password || !playerId) throw new BadRequestException('all credentials are required');

    const emailRgx = new RegExp(/^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/);

    if (!emailRgx.test(email) || password.length <= 6) throw new BadRequestException('invalid email or password');

    let user = await this.usersService.findByEmail(email);

    if (!user) throw new BadRequestException('Incorrect email or password');

    if (!user.isVerified) throw new BadRequestException('user not verified');

    const correctPassword = await bcrypt.compare(password, user.password);
    if (!correctPassword) throw new BadRequestException('Incorrect email or password');

    const accessToken = this.getAccessToken(user.id)
    await this.bot.telegram.sendMessage(this.configService.get<string>('CHANNEL_ID'), `👋\n${user.username} is successfully logged in\ntotal widgets: ${user.widgets}`)

    return {
      user: user,
      accessToken
    }
  }

  public async sendForgetPasswordEmail(data: Partial<RegisterDto>) {
    const { email } = data;

    if (!email) throw new BadRequestException('all credentials are required');

    const emailRgx = new RegExp(/^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/);

    if (!emailRgx.test(email)) throw new BadRequestException('invalid email');

    let user = await this.usersService.findByEmail(email);

    if (!user) throw new BadRequestException('user not found');

    if (!user.isVerified) throw new BadRequestException('user not verified');

    var password = generator.generate({
      length: 10,
      numbers: true
    });

    await this.emailConfirmationService.sendCode(user.email, { password }, 'forgot-password.ejs', 'New Password');

    let newPassword = await bcrypt.hash(password, 12);
    user.changedPassword = newPassword
    await user.save()

    return {
      user: user,
    }

  }

  public async forgetPassword(data: Partial<RegisterDto>) {
    const { email, password } = data;

    if (!email || !password) throw new BadRequestException('all credentials are required');

    const emailRgx = new RegExp(/^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/);

    if (!emailRgx.test(email) || password.length <= 6) throw new BadRequestException('invalid email or password');

    let user = await this.usersService.findByEmail(email);

    if (!user) throw new BadRequestException('user not found');
    if (!user.isVerified) throw new BadRequestException('user not verified');

    const correctPassword = await bcrypt.compare(password, user.changedPassword);
    if (!correctPassword) throw new BadRequestException('Incorrect password');

    const newPassword = await bcrypt.hash(password, 12);
    user.password = newPassword
    await user.save()

    const accessToken = this.getAccessToken(user.id)

    return {
      user: user,
      accessToken
    }
  }

  public async editPassword(userId: string, oldPassword: string, password: string) {

    let user = await this.usersService.findById(userId);

    if (!user) throw new BadRequestException('user not found');

    const correctPassword = await bcrypt.compare(oldPassword, user.password);
    if (!correctPassword) throw new BadRequestException('Incorrect password');

    const newPassword = await bcrypt.hash(password, 12);
    user.password = newPassword
    await user.save()

    const accessToken = this.getAccessToken(user.id)

    return {
      user: user,
      accessToken
    }
  }

  public async registerWithToken(data: RegisterDto, userId: string) {
    const { email, password, playerId } = data;

    if (!email || !password || !playerId) {
      throw new BadRequestException('all credentials are required');
    }

    const emailRgx = new RegExp(/^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/);

    if (!emailRgx.test(email) || password.length < 5) {
      throw new BadRequestException('invalid email or password');
    }

    let user = await this.usersService.findById(userId);

    if (!user) {
      throw new NotFoundException('user not found');
    }


    if (user && user.isVerified) {
      const accessToken = this.getAccessToken(user.id)
      return {
        user,
        accessToken
      }
    }

    let newPassword = await bcrypt.hash(password, 12);
    user.isVerified = true
    user.email = email
    user.username = email.split('@')[0]
    user.editedUsername = email.split('@')[0]
    user.password = newPassword
    user.playerId = playerId
    await user.save()
    const accessToken = this.getAccessToken(user.id)
    return {
      user: user,
      accessToken
    }

  }

  public async skipLogin() {
    const code = new Date().getTime().toString()
    const username = `guest-${code}`
    const user = await this.usersService.create({
      username,
      editedUsername: username.toLowerCase(),
      code,
      profileImage: `logo${Math.floor(Math.random() * 8) + 1}.png`,
    })
    const accessToken = this.getAccessToken(user.id)
    await this.bot.telegram.sendMessage(this.configService.get<string>('CHANNEL_ID'), `⏩\nuser skip signup\n`)
    return {
      user,
      accessToken
    }
  }

  public async deleteAccount(userId: string) {
    const user = await this.usersService.findById(userId)
    if (!user) throw new NotFoundException('user not found')
    await this.widgetService.deleteUserFromWidgets(userId)
    await this.bot.telegram.sendMessage(this.configService.get<string>('CHANNEL_ID'), `🗑❌\n${user.email} is successfully deleted account\ntotal try: ${user.widgets}`)
    return true
  }

  async removeRefreshToken(userId: string) {
    const token = this.getLogOutToken(userId)
    const result = {
      access: token,
    }
    return result
  }

  public async generateTwoToken(userId: string) {
    const user = await this.usersService.findById(userId)
    if (!user) throw new NotFoundException('user not found')
    await user.save()
    const accessToken = this.getAccessToken(user.id)
    return {
      access: accessToken,
    }
  }

  private getAccessToken(userId: string, tokenType: TokenType = TokenType.ACCESS_TOKEN) {
    const payload: TokenPayload = { userId, tokenType }
    const token = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET'),
      // expiresIn: `${this.configService.get('JWT_ACCESS_TOKEN_EXPIRATION_TIME',)}s`,
    })
    return token
  }

  private getLogOutToken(userId: string, tokenType: TokenType = TokenType.REFRESH_TOKEN) {
    const payload: TokenPayload = { userId, tokenType }
    const token = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_LOGOUT_TOKEN_SECRET'),
      expiresIn: `${this.configService.get('JWT_LOGOUT_TOKEN_EXPIRATION_TIME',)}`,
    })
    return token
  }

}
