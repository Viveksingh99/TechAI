import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { AppConfig } from '../config/configuration';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../common/interfaces/authenticated-user.interface';
import { parseDurationToMs } from '../common/utils/duration.util';
import { AuthService } from './auth.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import {
  AuthResponse,
  AuthTokens,
  SafeUser,
} from './interfaces/auth-response.interface';

const REFRESH_TOKEN_COOKIE = 'refreshToken';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly config: ConfigService<AppConfig, true>,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  async register(
    @Body() dto: RegisterDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<Omit<AuthResponse, 'refreshToken'>> {
    const result = await this.authService.register(dto, this.requestMeta(req));
    this.setRefreshTokenCookie(res, result.refreshToken);

    return { user: result.user, accessToken: result.accessToken };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<Omit<AuthResponse, 'refreshToken'>> {
    const result = await this.authService.login(dto, this.requestMeta(req));
    this.setRefreshTokenCookie(res, result.refreshToken);

    return { user: result.user, accessToken: result.accessToken };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Body() dto: RefreshTokenDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ accessToken: string }> {
    const token =
      dto.refreshToken ??
      (req.cookies?.[REFRESH_TOKEN_COOKIE] as string | undefined);
    const tokens: AuthTokens = await this.authService.refresh(
      token ?? '',
      this.requestMeta(req),
    );
    this.setRefreshTokenCookie(res, tokens.refreshToken);

    return { accessToken: tokens.accessToken };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async logout(
    @CurrentUser('id') userId: string,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ message: string }> {
    const cookieToken = req.cookies?.[REFRESH_TOKEN_COOKIE] as
      string | undefined;
    const bodyToken = (req.body as { refreshToken?: string } | undefined)
      ?.refreshToken;
    const result = await this.authService.logout(
      userId,
      cookieToken ?? bodyToken,
    );
    res.clearCookie(REFRESH_TOKEN_COOKIE, { path: '/api/v1/auth' });

    return result;
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  forgotPassword(@Body() dto: ForgotPasswordDto): Promise<{ message: string }> {
    return this.authService.forgotPassword(dto);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  resetPassword(@Body() dto: ResetPasswordDto): Promise<{ message: string }> {
    return this.authService.resetPassword(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: AuthenticatedUser): Promise<SafeUser> {
    return this.authService.me(user.id);
  }

  private setRefreshTokenCookie(res: Response, refreshToken: string): void {
    const maxAge = parseDurationToMs(
      this.config.get('jwt.refreshExpiresIn', { infer: true }),
    );

    res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, {
      httpOnly: true,
      secure: this.config.get('nodeEnv', { infer: true }) === 'production',
      sameSite: 'lax',
      path: '/api/v1/auth',
      maxAge,
      domain: this.config.get('cookie.domain', { infer: true }),
    });
  }

  private requestMeta(req: Request): { ip?: string; userAgent?: string } {
    return { ip: req.ip, userAgent: req.headers['user-agent'] };
  }
}
