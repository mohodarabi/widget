import { Module } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { UsersModule } from '../users/users.module';
import { AuthenticationController } from './authentication.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { JwtStrategy } from './accessToken/jwt.strategy';
import { LocalStrategy } from './loginToken/login.strategy';
import { WidgetModule } from 'src/widget/widget.module';
import { EmailConfirmationModule } from './../emailConfirmation/emailConfirmation.module'


@Module({
  imports: [
    UsersModule,
    WidgetModule,
    PassportModule,
    ConfigModule,
    EmailConfirmationModule,
    JwtModule.register({}),
  ],
  providers: [
    AuthenticationService,
    LocalStrategy,
    JwtStrategy,
  ],
  controllers: [AuthenticationController],
  exports: [AuthenticationService],
})
export class AuthenticationModule { }
