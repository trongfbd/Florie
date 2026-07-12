import { randomBytes, createHash } from 'crypto';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { JwtPayload } from './types/jwt-payload.type';
import { AuthResponseDto } from './dto/auth-response.dto';

interface TokenPair {
  accessToken: string;
  refreshToken: string;
  refreshTokenExpiresAt: Date;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(email: string, password: string): Promise<AuthResponseDto & { refreshToken: string; refreshTokenExpiresAt: Date }> {
    const user = await this.usersService.findByEmail(email);

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatches) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    const { accessToken, refreshToken, refreshTokenExpiresAt } = await this.issueTokenPair(
      user.id,
      user.email,
      user.role,
    );

    return {
      accessToken,
      refreshToken,
      refreshTokenExpiresAt,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    };
  }

  async refresh(
    rawRefreshToken: string,
  ): Promise<AuthResponseDto & { refreshToken: string; refreshTokenExpiresAt: Date }> {
    const tokenHash = this.hashToken(rawRefreshToken);

    const existing = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!existing || existing.revokedAt || existing.expiresAt < new Date()) {
      throw new UnauthorizedException('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại');
    }

    if (!existing.user.isActive) {
      throw new UnauthorizedException('Tài khoản đã bị khóa');
    }

    // Rotate: revoke the used token so it cannot be replayed.
    await this.prisma.refreshToken.update({
      where: { id: existing.id },
      data: { revokedAt: new Date() },
    });

    const { accessToken, refreshToken, refreshTokenExpiresAt } = await this.issueTokenPair(
      existing.user.id,
      existing.user.email,
      existing.user.role,
    );

    return {
      accessToken,
      refreshToken,
      refreshTokenExpiresAt,
      user: {
        id: existing.user.id,
        email: existing.user.email,
        name: existing.user.name,
        role: existing.user.role,
      },
    };
  }

  async logout(rawRefreshToken: string | undefined): Promise<void> {
    if (!rawRefreshToken) {
      return;
    }

    const tokenHash = this.hashToken(rawRefreshToken);
    await this.prisma.refreshToken.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  private async issueTokenPair(userId: string, email: string, role: JwtPayload['role']): Promise<TokenPair> {
    const payload: JwtPayload = { sub: userId, email, role };
    const accessToken = await this.jwtService.signAsync(payload);

    const rawRefreshToken = randomBytes(64).toString('hex');
    const tokenHash = this.hashToken(rawRefreshToken);
    const expiresInDays = this.configService.get<number>('JWT_REFRESH_EXPIRES_IN_DAYS', 7);
    const refreshTokenExpiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000);

    await this.prisma.refreshToken.create({
      data: { tokenHash, userId, expiresAt: refreshTokenExpiresAt },
    });

    return { accessToken, refreshToken: rawRefreshToken, refreshTokenExpiresAt };
  }

  private hashToken(rawToken: string): string {
    return createHash('sha256').update(rawToken).digest('hex');
  }
}
