import { Injectable, NotFoundException } from '@nestjs/common';
import { Banner, BannerPosition, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { buildPaginatedResult, PaginatedResult } from '../common/dto/paginated-result.dto';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
import { QueryBannerDto } from './dto/query-banner.dto';

@Injectable()
export class BannersService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateBannerDto): Promise<Banner> {
    return this.prisma.banner.create({
      data: {
        ...dto,
        startAt: dto.startAt ? new Date(dto.startAt) : undefined,
        endAt: dto.endAt ? new Date(dto.endAt) : undefined,
      },
    });
  }

  async findAll(query: QueryBannerDto): Promise<PaginatedResult<Banner>> {
    const where: Prisma.BannerWhereInput = {
      ...(query.position && { position: query.position }),
      ...(query.isActive !== undefined && { isActive: query.isActive }),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.banner.findMany({
        where,
        orderBy: { [query.sortBy]: query.sortOrder },
        skip: query.skip,
        take: query.take,
      }),
      this.prisma.banner.count({ where }),
    ]);

    return buildPaginatedResult(data, total, query.page, query.limit);
  }

  async findOne(id: string): Promise<Banner> {
    const banner = await this.prisma.banner.findUnique({ where: { id } });
    if (!banner) {
      throw new NotFoundException('Không tìm thấy banner');
    }
    return banner;
  }

  /** Public storefront: active banners at a position, currently within their display window. */
  findPublicByPosition(position: BannerPosition): Promise<Banner[]> {
    const now = new Date();
    return this.prisma.banner.findMany({
      where: {
        position,
        isActive: true,
        AND: [
          { OR: [{ startAt: null }, { startAt: { lte: now } }] },
          { OR: [{ endAt: null }, { endAt: { gte: now } }] },
        ],
      },
      orderBy: { displayOrder: 'asc' },
    });
  }

  async update(id: string, dto: UpdateBannerDto): Promise<Banner> {
    await this.findOne(id);
    return this.prisma.banner.update({
      where: { id },
      data: {
        ...dto,
        ...(dto.startAt && { startAt: new Date(dto.startAt) }),
        ...(dto.endAt && { endAt: new Date(dto.endAt) }),
      },
    });
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.prisma.banner.delete({ where: { id } });
  }
}
