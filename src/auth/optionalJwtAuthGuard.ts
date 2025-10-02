import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context) as boolean | Promise<boolean>;
  }

  handleRequest(err, user, info) {
    // Если нет токена или он невалидный — просто вернём null вместо выброса ошибки
    if (err || !user) {
      return null;
    }
    return user;
  }
}
