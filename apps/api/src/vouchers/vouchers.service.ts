import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { DiscountType, Prisma, Voucher } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { buildPaginatedResult, PaginatedResult } from '../common/dto/paginated-result.dto';
import { computeVoucherDiscount } from '../common/utils/voucher-discount.util';
import { CreateVoucherDto } from './dto/create-voucher.dto';
import { UpdateVoucherDto } from './dto/update-voucher.dto';
import { QueryVoucherDto } from './dto/query-voucher.dto';
import { ValidateVoucherDto } from './dto/validate-voucher.dto';

const VOUCHER_INCLUDE = {
  _count: { select: { claims: true } },
} satisfies Prisma.VoucherInclude;

type VoucherWithClaimCount = Prisma.VoucherGetPayload<{ include: typeof VOUCHER_INCLUDE }>;

@Injectable()
export class VouchersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateVoucherDto): Promise<Voucher> {
    this.assertDateRange(dto.startAt, dto.endAt);
    this.assertPercentageRange(dto.discountType, dto.discountValue);
    const code = dto.code.trim().toUpperCase();
    await this.assertCodeAvailable(code);

    return this.prisma.voucher.create({
      data: { ...dto, code, startAt: new Date(dto.startAt), endAt: new Date(dto.endAt) },
    });
  }

  async findAll(query: QueryVoucherDto): Promise<PaginatedResult<VoucherWithClaimCount>> {
    const where: Prisma.VoucherWhereInput = {
      ...(query.search && { code: { contains: query.search, mode: 'insensitive' } }),
      ...(query.isActive !== undefined && { isActive: query.isActive }),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.voucher.findMany({
        where,
        include: VOUCHER_INCLUDE,
        orderBy: { [query.sortBy]: query.sortOrder },
        skip: query.skip,
        take: query.take,
      }),
      this.prisma.voucher.count({ where }),
    ]);

    return buildPaginatedResult(data, total, query.page, query.limit);
  }

  async findOne(id: string): Promise<VoucherWithClaimCount> {
    const voucher = await this.prisma.voucher.findUnique({ where: { id }, include: VOUCHER_INCLUDE });
    if (!voucher) {
      throw new NotFoundException('Không tìm thấy voucher');
    }
    return voucher;
  }

  async update(id: string, dto: UpdateVoucherDto): Promise<Voucher> {
    const current = await this.findOne(id);

    const startAt = dto.startAt ?? current.startAt.toISOString();
    const endAt = dto.endAt ?? current.endAt.toISOString();
    this.assertDateRange(startAt, endAt);
    this.assertPercentageRange(
      dto.discountType ?? current.discountType,
      dto.discountValue ?? current.discountValue,
    );

    let code: string | undefined;
    if (dto.code) {
      code = dto.code.trim().toUpperCase();
      await this.assertCodeAvailable(code, id);
    }

    return this.prisma.voucher.update({
      where: { id },
      data: {
        ...dto,
        ...(code && { code }),
        ...(dto.startAt && { startAt: new Date(dto.startAt) }),
        ...(dto.endAt && { endAt: new Date(dto.endAt) }),
      },
    });
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.prisma.voucher.delete({ where: { id } });
  }

  /** Public storefront preview — same math as order creation, no side effects (usedCount untouched). */
  async validate(dto: ValidateVoucherDto): Promise<{ discountAmount: number; total: number }> {
    const voucher = await this.prisma.voucher.findUnique({
      where: { code: dto.code.trim().toUpperCase() },
    });
    if (!voucher) {
      throw new BadRequestException('Voucher không hợp lệ');
    }

    const discountAmount = computeVoucherDiscount(voucher, dto.subtotal);
    return { discountAmount, total: dto.subtotal - discountAmount };
  }

  private assertDateRange(startAt: string, endAt: string): void {
    if (new Date(startAt) >= new Date(endAt)) {
      throw new BadRequestException('Ngày bắt đầu phải trước ngày kết thúc');
    }
  }

  private assertPercentageRange(discountType: DiscountType, discountValue: number): void {
    if (discountType === DiscountType.PERCENTAGE && discountValue > 100) {
      throw new BadRequestException('Giá trị giảm theo phần trăm không được vượt quá 100');
    }
  }

  private async assertCodeAvailable(code: string, excludeId?: string): Promise<void> {
    const existing = await this.prisma.voucher.findUnique({ where: { code }, select: { id: true } });
    if (existing && existing.id !== excludeId) {
      throw new ConflictException(`Mã voucher "${code}" đã tồn tại`);
    }
  }
}
