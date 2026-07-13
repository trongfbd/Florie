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
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Throttle } from '@nestjs/throttler';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { Public } from '../auth/decorators/public.decorator';
import { CustomerAuthService } from './customer-auth.service';
import { RegisterCustomerDto } from './dto/register-customer.dto';
import { LoginCustomerDto } from './dto/login-customer.dto';
import { GoogleLoginDto } from './dto/google-login.dto';
import { CustomerAuthResponseDto, CustomerProfileDto } from './dto/customer-auth-response.dto';
import { CustomerJwtAuthGuard } from './guards/customer-jwt-auth.guard';
import { CurrentCustomer } from './decorators/current-customer.decorator';
import type { AuthenticatedCustomer } from './types/customer-jwt-payload.type';

const COOKIE_NAME = 'florie_customer_refresh_token';
const COOKIE_PATH = '/api/v1/customer-auth';

@ApiTags('customer-auth')
@Controller('customer-auth')
export class CustomerAuthController {
  constructor(
    private readonly customerAuthService: CustomerAuthService,
    private readonly configService: ConfigService,
  ) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Đăng ký tài khoản khách hàng' })
  @ApiOkResponse({ type: CustomerAuthResponseDto })
  async register(
    @Body() dto: RegisterCustomerDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<CustomerAuthResponseDto> {
    const { refreshToken, refreshTokenExpiresAt, ...result } =
      await this.customerAuthService.register(dto);
    this.setRefreshTokenCookie(response, refreshToken, refreshTokenExpiresAt);
    return result;
  }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Đăng nhập khách hàng' })
  @ApiOkResponse({ type: CustomerAuthResponseDto })
  async login(
    @Body() dto: LoginCustomerDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<CustomerAuthResponseDto> {
    const { refreshToken, refreshTokenExpiresAt, ...result } = await this.customerAuthService.login(
      dto.phone,
      dto.password,
    );
    this.setRefreshTokenCookie(response, refreshToken, refreshTokenExpiresAt);
    return result;
  }

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('google')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Đăng nhập / đăng ký bằng Google' })
  @ApiOkResponse({ type: CustomerAuthResponseDto })
  async google(
    @Body() dto: GoogleLoginDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<CustomerAuthResponseDto> {
    const { refreshToken, refreshTokenExpiresAt, ...result } =
      await this.customerAuthService.loginWithGoogle(dto.idToken);
    this.setRefreshTokenCookie(response, refreshToken, refreshTokenExpiresAt);
    return result;
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cấp lại access token từ refresh token' })
  @ApiOkResponse({ type: CustomerAuthResponseDto })
  async refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<CustomerAuthResponseDto> {
    const rawRefreshToken = request.cookies?.[COOKIE_NAME];
    if (!rawRefreshToken) {
      throw new UnauthorizedException('Thiếu refresh token');
    }

    const { refreshToken, refreshTokenExpiresAt, ...result } =
      await this.customerAuthService.refresh(rawRefreshToken);
    this.setRefreshTokenCookie(response, refreshToken, refreshTokenExpiresAt);
    return result;
  }

  @Public()
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Đăng xuất' })
  async logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    await this.customerAuthService.logout(request.cookies?.[COOKIE_NAME]);
    response.clearCookie(COOKIE_NAME, { path: COOKIE_PATH });
  }

  @Public()
  @UseGuards(CustomerJwtAuthGuard)
  @Get('me')
  @ApiOperation({ summary: 'Thông tin khách hàng đang đăng nhập' })
  @ApiOkResponse({ type: CustomerProfileDto })
  me(@CurrentCustomer() customer: AuthenticatedCustomer): AuthenticatedCustomer {
    return customer;
  }

  private setRefreshTokenCookie(response: Response, token: string, expiresAt: Date): void {
    response.cookie(COOKIE_NAME, token, {
      httpOnly: true,
      secure: this.configService.get<string>('NODE_ENV') === 'production',
      sameSite: 'lax',
      path: COOKIE_PATH,
      expires: expiresAt,
    });
  }
}
