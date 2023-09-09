import { Controller, ClassSerializerInterceptor, UseInterceptors, Post, Body, UseGuards, Req } from '@nestjs/common';
import ConfirmEmailDto from './emailContext.dtos';
import { EmailConfirmationService } from './emailConfirmation.service';
import JwtAuthenticationGuard from 'src/authentication/accessToken/jwt-authentication.guard';
import RequestWithUser from 'src/authentication/interface/requestWithUser.interface';

@Controller('email-confirmation')
@UseInterceptors(ClassSerializerInterceptor)
export class EmailConfirmationController {
  constructor(private readonly emailConfirmationService: EmailConfirmationService) { }
}
