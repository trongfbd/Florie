import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Throttle } from '@nestjs/throttler';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto, AuthUserDto } from './dto/auth-response.dto';
import { Public } from './decorators/public.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import type { AuthenticatedUser } from './types/jwt-payload.type';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Đăng nhập Admin/Staff' })
  @ApiOkResponse({ type: AuthResponseDto })
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthResponseDto> {
    const { refreshToken, refreshTokenExpiresAt, ...result } = await this.authService.login(
      dto.email,
      dto.password,
    );
    this.setRefreshTokenCookie(response, refreshToken, refreshTokenExpiresAt);
    return result;
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cấp lại access token từ refresh token' })
  @ApiOkResponse({ type: AuthResponseDto })
  async refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthResponseDto> {
    const cookieName = this.configService.get<string>(
      'REFRESH_TOKEN_COOKIE_NAME',
      'florie_refresh_token',
    );
    const rawRefreshToken = request.cookies?.[cookieName];

    if (!rawRefreshToken) {
      throw new UnauthorizedException('Thiếu refresh token');
    }

    const { refreshToken, refreshTokenExpiresAt, ...result } =
      await this.authService.refresh(rawRefreshToken);
    this.setRefreshTokenCookie(response, refreshToken, refreshTokenExpiresAt);
    return result;
  }

  @Public()
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Đăng xuất, thu hồi refresh token' })
  async logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    const cookieName = this.configService.get<string>(
      'REFRESH_TOKEN_COOKIE_NAME',
      'florie_refresh_token',
    );
    await this.authService.logout(request.cookies?.[cookieName]);
    response.clearCookie(cookieName, { path: '/api/v1/auth' });
  }

  @Get('me')
  @ApiOperation({ summary: 'Thông tin tài khoản đang đăng nhập' })
  @ApiOkResponse({ type: AuthUserDto })
  me(@CurrentUser() user: AuthenticatedUser): AuthenticatedUser {
    return user;
  }

  private setRefreshTokenCookie(response: Response, token: string, expiresAt: Date): void {
    const cookieName = this.configService.get<string>(
      'REFRESH_TOKEN_COOKIE_NAME',
      'florie_refresh_token',
    );

    response.cookie(cookieName, token, {
      httpOnly: true,
      secure: this.configService.get<string>('NODE_ENV') === 'production',
      sameSite: 'lax',
      path: '/api/v1/auth',
      expires: expiresAt,
    });
  }
}
