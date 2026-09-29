import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';

const PASSWORD_SALT_ROUNDS = 10;

// passwordHash never leaves this service — every account-management response
// goes through this select, same reasoning as ProductsService's PUBLIC_OMIT.
const SAFE_USER_SELECT = {
  id: true,
  email: true,
  name: true,
  role: true,
  isActive: true,
  avatarUrl: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

export type SafeUser = Prisma.UserGetPayload<{
  select: typeof SAFE_USER_SELECT;
}>;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  findAll(): Promise<SafeUser[]> {
    return this.prisma.user.findMany({
      select: SAFE_USER_SELECT,
      orderBy: { createdAt: 'asc' },
    });
  }

  async create(dto: CreateUserDto): Promise<SafeUser> {
    const existing = await this.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Email đã được sử dụng cho tài khoản khác');
    }

    const passwordHash = await bcrypt.hash(dto.password, PASSWORD_SALT_ROUNDS);

    return this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        name: dto.name,
        role: dto.role,
      },
      select: SAFE_USER_SELECT,
    });
  }

  async updateRole(
    id: string,
    role: User['role'],
    actorUserId: string,
  ): Promise<SafeUser> {
    if (id === actorUserId) {
      throw new BadRequestException(
        'Không thể tự đổi vai trò của chính tài khoản đang đăng nhập',
      );
    }
    await this.assertExists(id);

    return this.prisma.user.update({
      where: { id },
      data: { role },
      select: SAFE_USER_SELECT,
    });
  }

  async setActive(
    id: string,
    isActive: boolean,
    actorUserId: string,
  ): Promise<SafeUser> {
    if (id === actorUserId) {
      throw new BadRequestException(
        'Không thể tự khoá/mở khoá chính tài khoản đang đăng nhập',
      );
    }
    await this.assertExists(id);

    return this.prisma.user.update({
      where: { id },
      data: { isActive },
      select: SAFE_USER_SELECT,
    });
  }

  private async assertExists(id: string): Promise<void> {
    const exists = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!exists) {
      throw new NotFoundException('Không tìm thấy tài khoản');
    }
  }
}
