import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest<TUser = unknown>(
    err: unknown,
    user: TUser | false,
    info: { message?: string } | undefined,
  ): TUser {
    if (err || !user) {
      throw new UnauthorizedException(
        info?.message ?? 'Invalid or expired access token',
      );
    }

    return user;
  }
}
