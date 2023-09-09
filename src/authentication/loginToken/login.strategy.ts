import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, NotAcceptableException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { UserService } from 'src/users/users.service';
import TokenPayload from '../interface/tokenPayload.interface';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local-strategy-token') {
  constructor(private readonly configService: ConfigService, private readonly userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          if (!request.headers.authorization) {
            throw new UnauthorizedException()
          }
          return request.headers.authorization.split('Bearer ')[1];
        },
      ]),
      secretOrKey: configService.get('JWT_ACCESS_TOKEN_SECRET'),
    });
  }

  async validate(payload: TokenPayload) {
    const user = this.userService.findById(payload.userId);
    if (!user) throw new NotAcceptableException('user not found')
    return user
  }
}
