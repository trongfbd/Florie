import { Injectable, NotFoundException } from '@nestjs/common';
import { Customer, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { buildPaginatedResult, PaginatedResult } from '../common/dto/paginated-result.dto';
import { QueryCustomerDto } from './dto/query-customer.dto';
import { CreateCustomerNoteDto } from './dto/create-customer-note.dto';

const CUSTOMER_DETAIL_INCLUDE = {
  addresses: { orderBy: { isDefault: 'desc' } },
  notes: {
    include: { author: { select: { id: true, name: true } } },
    orderBy: { createdAt: 'desc' },
  },
  orders: {
    select: { id: true, orderNumber: true, status: true, total: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
    take: 10,
  },
  _count: { select: { orders: true } },
} satisfies Prisma.CustomerInclude;

type CustomerDetail = Prisma.CustomerGetPayload<{
  include: typeof CUSTOMER_DETAIL_INCLUDE;
  omit: { passwordHash: true };
}>;

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

  findByPhone(phone: string): Promise<Customer | null> {
    return this.prisma.customer.findUnique({ where: { phone } });
  }

  findById(id: string): Promise<Customer | null> {
    return this.prisma.customer.findUnique({ where: { id } });
  }

  async findAll(query: QueryCustomerDto): Promise<PaginatedResult<Omit<Customer, 'passwordHash'>>> {
    const where: Prisma.CustomerWhereInput = {
      ...(query.isVip !== undefined && { isVip: query.isVip }),
      ...(query.search && {
        OR: [
          { name: { contains: query.search, mode: 'insensitive' } },
          { phone: { contains: query.search } },
          { email: { contains: query.search, mode: 'insensitive' } },
        ],
      }),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.customer.findMany({
        where,
        omit: { passwordHash: true },
        orderBy: { [query.sortBy]: query.sortOrder },
        skip: query.skip,
        take: query.take,
      }),
      this.prisma.customer.count({ where }),
    ]);

    return buildPaginatedResult(data, total, query.page, query.limit);
  }

  async findDetail(id: string): Promise<CustomerDetail> {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
      include: CUSTOMER_DETAIL_INCLUDE,
      omit: { passwordHash: true },
    });
    if (!customer) {
      throw new NotFoundException('Không tìm thấy khách hàng');
    }
    return customer;
  }

  async setVip(id: string, isVip: boolean): Promise<Omit<Customer, 'passwordHash'>> {
    await this.assertExists(id);
    return this.prisma.customer.update({ where: { id }, data: { isVip }, omit: { passwordHash: true } });
  }

  async addNote(id: string, dto: CreateCustomerNoteDto, authorId: string): Promise<CustomerDetail> {
    await this.assertExists(id);
    await this.prisma.customerNote.create({
      data: { customerId: id, authorId, content: dto.content },
    });
    return this.findDetail(id);
  }

  async removeNote(id: string, noteId: string): Promise<void> {
    const note = await this.prisma.customerNote.findUnique({ where: { id: noteId } });
    if (!note || note.customerId !== id) {
      throw new NotFoundException('Không tìm thấy ghi chú');
    }
    await this.prisma.customerNote.delete({ where: { id: noteId } });
  }

  private async assertExists(id: string): Promise<void> {
    const exists = await this.prisma.customer.findUnique({ where: { id }, select: { id: true } });
    if (!exists) {
      throw new NotFoundException('Không tìm thấy khách hàng');
    }
  }
}
