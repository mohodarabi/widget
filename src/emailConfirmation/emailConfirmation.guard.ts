import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, } from '@nestjs/common';
import RequestWithUser from 'src/authentication/interface/requestWithUser.interface';

@Injectable()
export class EmailConfirmationGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const request: RequestWithUser = context.switchToHttp().getRequest();

    if (!request.user?.isVerified) {
      throw new UnauthorizedException('Confirm your account first');
    }

    return true;
  }
}
