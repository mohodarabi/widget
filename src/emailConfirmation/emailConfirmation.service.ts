import { Injectable } from '@nestjs/common';
import { join } from 'path';
import { EmailContext } from './emailContext.dtos'
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class EmailConfirmationService {
  constructor(private readonly mailerService: MailerService) { }

  public sendCode(email: string, context: EmailContext, template: string, subject: string) {
    return this.mailerService.sendMail({
      from: {
        name: 'LoveWidget',
        address: 'enigmateam.dev@gmail.com',
      },
      to: email,
      subject,
      template: join(__dirname, '..', '..', 'templates', `${template}`),
      context,
    });
  }
}
