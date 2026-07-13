import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';
import { VouchersService } from './vouchers.service';
import { CreateVoucherDto } from './dto/create-voucher.dto';
import { UpdateVoucherDto } from './dto/update-voucher.dto';
import { QueryVoucherDto } from './dto/query-voucher.dto';
import { ValidateVoucherDto } from './dto/validate-voucher.dto';

@ApiTags('vouchers')
@Controller('vouchers')
export class VouchersController {
  constructor(private readonly vouchersService: VouchersService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo voucher' })
  create(@Body() dto: CreateVoucherDto) {
    return this.vouchersService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Danh sách voucher (phân trang/tìm kiếm/lọc/sắp xếp)' })
  findAll(@Query() query: QueryVoucherDto) {
    return this.vouchersService.findAll(query);
  }

  @Public()
  @Post('validate')
  @ApiOperation({ summary: '[Public] Xem trước mức giảm giá của một mã voucher' })
  validate(@Body() dto: ValidateVoucherDto) {
    return this.vouchersService.validate(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Chi tiết voucher' })
  findOne(@Param('id') id: string) {
    return this.vouchersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật voucher' })
  update(@Param('id') id: string, @Body() dto: UpdateVoucherDto) {
    return this.vouchersService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Xoá voucher' })
  remove(@Param('id') id: string) {
    return this.vouchersService.remove(id);
  }
}
