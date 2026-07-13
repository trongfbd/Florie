import { randomBytes, createHash } from 'crypto';
import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Customer } from '@prisma/client';
import { OAuth2Client } from 'google-auth-library';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CustomersService } from '../customers/customers.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CustomerJwtPayload } from './types/customer-jwt-payload.type';
import { RegisterCustomerDto } from './dto/register-customer.dto';
import { CustomerAuthResponseDto } from './dto/customer-auth-response.dto';
import { toAuthenticatedCustomer } from './utils/to-authenticated-customer';

const PASSWORD_SALT_ROUNDS = 10;

interface TokenPair {
  accessToken: string;
  refreshToken: string;
  refreshTokenExpiresAt: Date;
}

type AuthResult = CustomerAuthResponseDto & { refreshToken: string; refreshTokenExpiresAt: Date };

@Injectable()
export class CustomerAuthService {
  private readonly googleClient: OAuth2Client;

  constructor(
    private readonly customersService: CustomersService,
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly notificationsService: NotificationsService,
  ) {
    this.googleClient = new OAuth2Client(this.configService.get<string>('GOOGLE_CLIENT_ID'));
  }

  async register(dto: RegisterCustomerDto): Promise<AuthResult> {
    const existing = await this.customersService.findByPhone(dto.phone);
    if (existing) {
      throw new ConflictException('Số điện thoại này đã được đăng ký');
    }

    const passwordHash = await bcrypt.hash(dto.password, PASSWORD_SALT_ROUNDS);
    const customer = await this.prisma.customer.create({
      data: { name: dto.name, phone: dto.phone, email: dto.email, passwordHash },
    });

    await this.notificationsService.create(
      'NEW_CUSTOMER',
      'Khách hàng mới',
      `${customer.name} vừa đăng ký tài khoản (${customer.phone})`,
      customer.id,
    );

    return this.buildAuthResult(customer);
  }

  async login(phone: string, password: string): Promise<AuthResult> {
    const customer = await this.customersService.findByPhone(phone);

    if (!customer || !customer.passwordHash) {
      throw new UnauthorizedException('Số điện thoại hoặc mật khẩu không đúng');
    }

    const passwordMatches = await bcrypt.compare(password, customer.passwordHash);
    if (!passwordMatches) {
      throw new UnauthorizedException('Số điện thoại hoặc mật khẩu không đúng');
    }

    return this.buildAuthResult(customer);
  }

  /**
   * Verifies a Google ID token (never trusts client-supplied profile data
   * directly) and finds-or-creates the matching customer:
   *  1. Existing googleId match → log in as that customer.
   *  2. No googleId match, but a Google-*verified* email matches an existing
   *     phone-registered account → link this Google identity to it.
   *  3. Otherwise → create a brand-new customer (no phone yet; collected
   *     later at checkout).
   */
  async loginWithGoogle(idToken: string): Promise<AuthResult> {
    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    if (!clientId) {
      throw new UnauthorizedException('Đăng nhập Google chưa được cấu hình trên máy chủ');
    }

    let payload;
    try {
      const ticket = await this.googleClient.verifyIdToken({ idToken, audience: clientId });
      payload = ticket.getPayload();
    } catch {
      throw new UnauthorizedException('Token Google không hợp lệ');
    }

    if (!payload?.sub || !payload.email) {
      throw new UnauthorizedException('Không lấy được thông tin tài khoản Google');
    }

    const { sub: googleId, email, name, picture, email_verified: emailVerified } = payload;

    let customer = await this.prisma.customer.findUnique({ where: { googleId } });

    if (!customer && emailVerified) {
      const existingByEmail = await this.prisma.customer.findUnique({ where: { email } });
      if (existingByEmail) {
        customer = await this.prisma.customer.update({
          where: { id: existingByEmail.id },
          data: { googleId, avatarUrl: picture ?? existingByEmail.avatarUrl },
        });
      }
    }

    if (!customer) {
      customer = await this.prisma.customer.create({
        data: {
          googleId,
          email,
          name: name ?? email,
          avatarUrl: picture,
        },
      });

      await this.notificationsService.create(
        'NEW_CUSTOMER',
        'Khách hàng mới',
        `${customer.name} vừa đăng ký tài khoản qua Google (${customer.email})`,
        customer.id,
      );
    }

    return this.buildAuthResult(customer);
  }

  async refresh(rawRefreshToken: string): Promise<AuthResult> {
    const tokenHash = this.hashToken(rawRefreshToken);

    const existing = await this.prisma.customerRefreshToken.findUnique({
      where: { tokenHash },
      include: { customer: true },
    });

    if (!existing || existing.revokedAt || existing.expiresAt < new Date()) {
      throw new UnauthorizedException('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại');
    }

    await this.prisma.customerRefreshToken.update({
      where: { id: existing.id },
      data: { revokedAt: new Date() },
    });

    return this.buildAuthResult(existing.customer);
  }

  async logout(rawRefreshToken: string | undefined): Promise<void> {
    if (!rawRefreshToken) {
      return;
    }

    const tokenHash = this.hashToken(rawRefreshToken);
    await this.prisma.customerRefreshToken.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  private async buildAuthResult(customer: Customer): Promise<AuthResult> {
    const { accessToken, refreshToken, refreshTokenExpiresAt } = await this.issueTokenPair(
      customer.id,
      customer.phone,
    );

    return {
      accessToken,
      refreshToken,
      refreshTokenExpiresAt,
      customer: toAuthenticatedCustomer(customer),
    };
  }

  private async issueTokenPair(customerId: string, phone: string | null): Promise<TokenPair> {
    const payload: CustomerJwtPayload = { sub: customerId, phone, type: 'customer' };
    const accessToken = await this.jwtService.signAsync(payload);

    const rawRefreshToken = randomBytes(64).toString('hex');
    const tokenHash = this.hashToken(rawRefreshToken);
    const expiresInDays = this.configService.get<number>('JWT_CUSTOMER_REFRESH_EXPIRES_IN_DAYS', 30);
    const refreshTokenExpiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000);

    await this.prisma.customerRefreshToken.create({
      data: { tokenHash, customerId, expiresAt: refreshTokenExpiresAt },
    });

    return { accessToken, refreshToken: rawRefreshToken, refreshTokenExpiresAt };
  }

  private hashToken(rawToken: string): string {
    return createHash('sha256').update(rawToken).digest('hex');
  }
}
