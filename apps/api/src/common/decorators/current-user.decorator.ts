import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { AuthenticatedUser } from '../interfaces/authenticated-user.interface';

/**
 * Extracts the authenticated user (attached by `JwtStrategy`) from the
 * request. Pass a key to pluck a single property, e.g. `@CurrentUser('id')`.
 */
export const CurrentUser = createParamDecorator(
  (data: keyof AuthenticatedUser | undefined, ctx: ExecutionContext) => {
    const request = ctx
      .switchToHttp()
      .getRequest<Request & { user: AuthenticatedUser }>();
    const user = request.user;

    return data ? user?.[data] : user;
  },
);
