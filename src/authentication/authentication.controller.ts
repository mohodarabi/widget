import { Body, Req, Res, Controller, Post, UseGuards, Get, ClassSerializerInterceptor, UseInterceptors, Delete } from '@nestjs/common'
import { AuthenticationService } from './authentication.service'
import JwtAuthenticationGuard from './accessToken/jwt-authentication.guard'
import { LocalAuthenticationGuard } from './loginToken/login-authentication.guard'
import RegisterDto from './dtos/register.dto'
import RequestWithUser from './interface/requestWithUser.interface'
import { Response } from 'express'

@Controller('widget-ios/auth')
@UseInterceptors(ClassSerializerInterceptor)
export class AuthenticationController {

  constructor(private readonly authenticationService: AuthenticationService) { }

  @Post('signup')
  async signup(@Body() body: RegisterDto, @Res() res: Response) {
    const data = await this.authenticationService.signup(body)
    res.status(200).json({
      success: true,
      message: 'user successfully singed up',
      ...data
    })
  }

  @Post('login')
  async login(@Body() body: RegisterDto, @Res() res: Response) {
    const data = await this.authenticationService.login(body)
    res.status(200).json({
      success: true,
      message: 'user successfully singed up',
      ...data
    })
  }

  @Post('send-forget-email')
  async sendForgetPasswordEmail(@Body() body: Partial<RegisterDto>, @Res() res: Response) {
    const data = await this.authenticationService.sendForgetPasswordEmail(body)
    res.status(200).json({
      success: true,
      message: 'user successfully singed up',
      ...data
    })
  }

  @Post('forget-password')
  async forgetPassword(@Body() body: Partial<RegisterDto>, @Res() res: Response) {
    const data = await this.authenticationService.forgetPassword(body)
    res.status(200).json({
      success: true,
      message: 'user successfully singed up',
      ...data
    })
  }

  @Post('edit-password')
  @UseGuards(JwtAuthenticationGuard)
  async editPassword(@Req() req: RequestWithUser, @Res() res: Response) {
    const { user } = req
    const { oldPassword, password } = req.body
    const data = await this.authenticationService.editPassword(user.id, oldPassword, password)
    res.status(200).json({
      success: true,
      message: 'user successfully singed up',
      ...data
    })
  }

  @Post('login-token')
  @UseGuards(LocalAuthenticationGuard)
  async registerWithToken(@Body() body: RegisterDto, @Req() req: RequestWithUser, @Res() res: Response) {
    const { user } = req
    const data = await this.authenticationService.registerWithToken(body, user.id)
    res.status(200).json({
      success: true,
      message: 'user successfully singed up',
      ...data
    })
  }

  @Post('skip-login')
  async skipRegister(@Res() res: Response) {
    const data = await this.authenticationService.skipLogin()
    res.status(200).json({
      success: true,
      message: 'user successfully singed up',
      ...data
    })
  }

  @Delete('delete-account')
  @UseGuards(JwtAuthenticationGuard)
  async deleteUser(@Req() request: RequestWithUser, @Res() res: Response) {
    const { user } = request
    console.log(user);

    await this.authenticationService.deleteAccount(user.id)
    res.status(200).json({
      success: true,
      message: 'user successfully deleted',
    })
  }

  @Get('log-out')
  @UseGuards(JwtAuthenticationGuard)
  async logOut(@Req() req: RequestWithUser, @Res() res: Response) {
    const { user } = req
    const data = await this.authenticationService.removeRefreshToken(user.id)
    res.status(200).json({
      success: true,
      message: 'user successfully logged out',
      ...data
    })
  }

}