import { randomBytes, createHash } from 'crypto';
import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CustomersService } from '../customers/customers.service';
import { CustomerJwtPayload } from './types/customer-jwt-payload.type';
import { RegisterCustomerDto } from './dto/register-customer.dto';
import { CustomerAuthResponseDto } from './dto/customer-auth-response.dto';

const PASSWORD_SALT_ROUNDS = 10;

interface TokenPair {
  accessToken: string;
  refreshToken: string;
  refreshTokenExpiresAt: Date;
}

@Injectable()
export class CustomerAuthService {
  constructor(
    private readonly customersService: CustomersService,
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(
    dto: RegisterCustomerDto,
  ): Promise<CustomerAuthResponseDto & { refreshToken: string; refreshTokenExpiresAt: Date }> {
    const existing = await this.customersService.findByPhone(dto.phone);
    if (existing) {
      throw new ConflictException('Số điện thoại này đã được đăng ký');
    }

    const passwordHash = await bcrypt.hash(dto.password, PASSWORD_SALT_ROUNDS);
    const customer = await this.prisma.customer.create({
      data: { name: dto.name, phone: dto.phone, email: dto.email, passwordHash },
    });

    const { accessToken, refreshToken, refreshTokenExpiresAt } = await this.issueTokenPair(
      customer.id,
      customer.phone,
    );

    return {
      accessToken,
      refreshToken,
      refreshTokenExpiresAt,
      customer: { id: customer.id, name: customer.name, phone: customer.phone, email: customer.email },
    };
  }

  async login(
    phone: string,
    password: string,
  ): Promise<CustomerAuthResponseDto & { refreshToken: string; refreshTokenExpiresAt: Date }> {
    const customer = await this.customersService.findByPhone(phone);

    if (!customer || !customer.passwordHash) {
      throw new UnauthorizedException('Số điện thoại hoặc mật khẩu không đúng');
    }

    const passwordMatches = await bcrypt.compare(password, customer.passwordHash);
    if (!passwordMatches) {
      throw new UnauthorizedException('Số điện thoại hoặc mật khẩu không đúng');
    }

    const { accessToken, refreshToken, refreshTokenExpiresAt } = await this.issueTokenPair(
      customer.id,
      customer.phone,
    );

    return {
      accessToken,
      refreshToken,
      refreshTokenExpiresAt,
      customer: { id: customer.id, name: customer.name, phone: customer.phone, email: customer.email },
    };
  }

  async refresh(
    rawRefreshToken: string,
  ): Promise<CustomerAuthResponseDto & { refreshToken: string; refreshTokenExpiresAt: Date }> {
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

    const { accessToken, refreshToken, refreshTokenExpiresAt } = await this.issueTokenPair(
      existing.customer.id,
      existing.customer.phone,
    );

    return {
      accessToken,
      refreshToken,
      refreshTokenExpiresAt,
      customer: {
        id: existing.customer.id,
        name: existing.customer.name,
        phone: existing.customer.phone,
        email: existing.customer.email,
      },
    };
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

  private async issueTokenPair(customerId: string, phone: string): Promise<TokenPair> {
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
