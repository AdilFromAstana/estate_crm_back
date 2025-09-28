// src/auth/jwt-auth.guard.ts
import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err, user, info, context) {
    if (err || !user) {
      console.error('❌ Auth error:', err, 'ℹ️ Info:', info);

      if (info?.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Access token expired');
      }
      if (info?.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Invalid access token');
      }
      if (info?.name === 'NotBeforeError') {
        throw new ForbiddenException('Token not active yet');
      }

      throw err || new UnauthorizedException('Unauthorized');
    }

    return user;
  }
}
