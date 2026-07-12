import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { buildPaginatedResult, PaginatedResult } from '../common/dto/paginated-result.dto';
import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';
import { QueryMaterialDto } from './dto/query-material.dto';
import { ImportMaterialDto } from './dto/import-material.dto';

const MATERIAL_INCLUDE = {
  supplier: { select: { id: true, name: true } },
} satisfies Prisma.MaterialInclude;

type MaterialWithSupplier = Prisma.MaterialGetPayload<{ include: typeof MATERIAL_INCLUDE }>;

@Injectable()
export class MaterialsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateMaterialDto): Promise<MaterialWithSupplier> {
    if (dto.supplierId) {
      await this.assertSupplierExists(dto.supplierId);
    }
    return this.prisma.material.create({ data: dto, include: MATERIAL_INCLUDE });
  }

  async findAll(query: QueryMaterialDto): Promise<PaginatedResult<MaterialWithSupplier>> {
    const where: Prisma.MaterialWhereInput = {
      ...(query.search && { name: { contains: query.search, mode: 'insensitive' } }),
      ...(query.type && { type: query.type }),
      ...(query.isActive !== undefined && { isActive: query.isActive }),
      ...(query.supplierId && { supplierId: query.supplierId }),
    };

    if (!query.lowStock) {
      const [data, total] = await this.prisma.$transaction([
        this.prisma.material.findMany({
          where,
          include: MATERIAL_INCLUDE,
          orderBy: { [query.sortBy]: query.sortOrder },
          skip: query.skip,
          take: query.take,
        }),
        this.prisma.material.count({ where }),
      ]);
      return buildPaginatedResult(data, total, query.page, query.limit);
    }

    // "Low stock" compares two columns of the same row (stockQuantity vs.
    // minStockThreshold), which Prisma's query builder can't express directly.
    // The shop's material catalog is small (tens of rows), so filtering in
    // application code is simpler and safer here than hand-written raw SQL.
    const candidates = await this.prisma.material.findMany({
      where,
      include: MATERIAL_INCLUDE,
      orderBy: { [query.sortBy]: query.sortOrder },
    });
    const lowStockItems = candidates.filter((material) =>
      material.stockQuantity.lessThanOrEqualTo(material.minStockThreshold),
    );
    const data = lowStockItems.slice(query.skip, query.skip + query.take);
    return buildPaginatedResult(data, lowStockItems.length, query.page, query.limit);
  }

  async findOne(id: string): Promise<MaterialWithSupplier> {
    const material = await this.prisma.material.findUnique({ where: { id }, include: MATERIAL_INCLUDE });
    if (!material) {
      throw new NotFoundException('Không tìm thấy vật tư');
    }
    return material;
  }

  async update(id: string, dto: UpdateMaterialDto): Promise<MaterialWithSupplier> {
    await this.findOne(id);
    if (dto.supplierId) {
      await this.assertSupplierExists(dto.supplierId);
    }
    return this.prisma.material.update({ where: { id }, data: dto, include: MATERIAL_INCLUDE });
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);

    const bomCount = await this.prisma.productMaterial.count({ where: { materialId: id } });
    if (bomCount > 0) {
      throw new ConflictException(
        'Vật tư đang được dùng trong công thức bó hoa (BOM) của sản phẩm — hãy gỡ khỏi công thức trước.',
      );
    }

    await this.prisma.material.delete({ where: { id } });
  }

  async importStock(materialId: string, dto: ImportMaterialDto): Promise<MaterialWithSupplier> {
    const material = await this.findOne(materialId);
    const supplierId = dto.supplierId ?? material.supplierId ?? undefined;

    if (supplierId) {
      await this.assertSupplierExists(supplierId);
    }

    await this.prisma.$transaction([
      this.prisma.materialImportLog.create({
        data: {
          materialId,
          supplierId,
          quantity: dto.quantity,
          unitCost: dto.unitCost,
          note: dto.note,
        },
      }),
      this.prisma.material.update({
        where: { id: materialId },
        data: {
          stockQuantity: { increment: dto.quantity },
          latestCostPrice: dto.unitCost,
        },
      }),
    ]);

    return this.findOne(materialId);
  }

  private async assertSupplierExists(supplierId: string): Promise<void> {
    const exists = await this.prisma.supplier.findUnique({
      where: { id: supplierId },
      select: { id: true },
    });
    if (!exists) {
      throw new NotFoundException('Không tìm thấy nhà cung cấp');
    }
  }
}
