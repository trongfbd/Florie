import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/types/jwt-payload.type';
import { CustomersService } from './customers.service';
import { QueryCustomerDto } from './dto/query-customer.dto';
import { SetVipDto } from './dto/set-vip.dto';
import { CreateCustomerNoteDto } from './dto/create-customer-note.dto';

@ApiTags('customers')
@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get()
  @ApiOperation({ summary: 'Danh sách khách hàng (phân trang/tìm kiếm/lọc VIP/sắp xếp)' })
  findAll(@Query() query: QueryCustomerDto) {
    return this.customersService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Hồ sơ khách hàng: địa chỉ, ghi chú, 10 đơn gần nhất' })
  findOne(@Param('id') id: string) {
    return this.customersService.findDetail(id);
  }

  @Patch(':id/vip')
  @ApiOperation({ summary: 'Đánh dấu / bỏ đánh dấu khách VIP' })
  setVip(@Param('id') id: string, @Body() dto: SetVipDto) {
    return this.customersService.setVip(id, dto.isVip);
  }

  @Post(':id/notes')
  @ApiOperation({ summary: 'Thêm ghi chú nội bộ về khách hàng' })
  addNote(
    @Param('id') id: string,
    @Body() dto: CreateCustomerNoteDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.customersService.addNote(id, dto, user.id);
  }

  @Delete(':id/notes/:noteId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Xoá ghi chú' })
  removeNote(@Param('id') id: string, @Param('noteId') noteId: string) {
    return this.customersService.removeNote(id, noteId);
  }
}
