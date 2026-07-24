import { IsOptional, IsString } from 'class-validator';

export class RefreshTokenDto {
  /**
   * Optional because the refresh token is typically read from the
   * `refreshToken` httpOnly cookie. Clients that cannot use cookies
   * (mobile apps, tests) may pass it explicitly in the body instead.
   */
  @IsOptional()
  @IsString()
  refreshToken?: string;
}
