import { Injectable, NotFoundException } from '@nestjs/common';
import { Expense, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { buildPaginatedResult, PaginatedResult } from '../common/dto/paginated-result.dto';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { QueryExpenseDto } from './dto/query-expense.dto';

const EXPENSE_INCLUDE = {
  createdBy: { select: { id: true, name: true } },
} satisfies Prisma.ExpenseInclude;

type ExpenseWithCreator = Prisma.ExpenseGetPayload<{ include: typeof EXPENSE_INCLUDE }>;

@Injectable()
export class ExpensesService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateExpenseDto, createdById: string): Promise<ExpenseWithCreator> {
    return this.prisma.expense.create({
      data: {
        ...dto,
        createdById,
        expenseDate: dto.expenseDate ? new Date(dto.expenseDate) : undefined,
      },
      include: EXPENSE_INCLUDE,
    });
  }

  async findAll(query: QueryExpenseDto): Promise<PaginatedResult<ExpenseWithCreator>> {
    const where: Prisma.ExpenseWhereInput = {
      ...(query.category && { category: query.category }),
      ...(query.search && {
        OR: [
          { description: { contains: query.search, mode: 'insensitive' } },
          { note: { contains: query.search, mode: 'insensitive' } },
        ],
      }),
      ...((query.from || query.to) && {
        expenseDate: {
          ...(query.from && { gte: new Date(query.from) }),
          ...(query.to && { lte: new Date(query.to) }),
        },
      }),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.expense.findMany({
        where,
        include: EXPENSE_INCLUDE,
        orderBy: { [query.sortBy]: query.sortOrder },
        skip: query.skip,
        take: query.take,
      }),
      this.prisma.expense.count({ where }),
    ]);

    return buildPaginatedResult(data, total, query.page, query.limit);
  }

  async findOne(id: string): Promise<ExpenseWithCreator> {
    const expense = await this.prisma.expense.findUnique({ where: { id }, include: EXPENSE_INCLUDE });
    if (!expense) {
      throw new NotFoundException('Không tìm thấy khoản chi');
    }
    return expense;
  }

  async update(id: string, dto: UpdateExpenseDto): Promise<ExpenseWithCreator> {
    await this.findOne(id);
    return this.prisma.expense.update({
      where: { id },
      data: { ...dto, ...(dto.expenseDate && { expenseDate: new Date(dto.expenseDate) }) },
      include: EXPENSE_INCLUDE,
    });
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.prisma.expense.delete({ where: { id } });
  }
}
