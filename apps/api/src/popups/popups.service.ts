import { Injectable, NotFoundException } from '@nestjs/common';
import { Popup, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { buildPaginatedResult, PaginatedResult } from '../common/dto/paginated-result.dto';
import { CreatePopupDto } from './dto/create-popup.dto';
import { UpdatePopupDto } from './dto/update-popup.dto';
import { QueryPopupDto } from './dto/query-popup.dto';

@Injectable()
export class PopupsService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreatePopupDto): Promise<Popup> {
    return this.prisma.popup.create({
      data: {
        ...dto,
        startAt: dto.startAt ? new Date(dto.startAt) : undefined,
        endAt: dto.endAt ? new Date(dto.endAt) : undefined,
      },
    });
  }

  async findAll(query: QueryPopupDto): Promise<PaginatedResult<Popup>> {
    const where: Prisma.PopupWhereInput = {
      ...(query.isActive !== undefined && { isActive: query.isActive }),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.popup.findMany({
        where,
        orderBy: { [query.sortBy]: query.sortOrder },
        skip: query.skip,
        take: query.take,
      }),
      this.prisma.popup.count({ where }),
    ]);

    return buildPaginatedResult(data, total, query.page, query.limit);
  }

  async findOne(id: string): Promise<Popup> {
    const popup = await this.prisma.popup.findUnique({ where: { id } });
    if (!popup) {
      throw new NotFoundException('Không tìm thấy popup');
    }
    return popup;
  }

  /** Public storefront: the currently-running popup, if any (soonest-ending wins if overlapping). */
  findActive(): Promise<Popup | null> {
    const now = new Date();
    return this.prisma.popup.findFirst({
      where: {
        isActive: true,
        AND: [
          { OR: [{ startAt: null }, { startAt: { lte: now } }] },
          { OR: [{ endAt: null }, { endAt: { gte: now } }] },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(id: string, dto: UpdatePopupDto): Promise<Popup> {
    await this.findOne(id);
    return this.prisma.popup.update({
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
    await this.prisma.popup.delete({ where: { id } });
  }
}
