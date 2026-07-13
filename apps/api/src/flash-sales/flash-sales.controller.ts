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
import { FlashSalesService } from './flash-sales.service';
import { CreateFlashSaleDto } from './dto/create-flash-sale.dto';
import { UpdateFlashSaleDto } from './dto/update-flash-sale.dto';
import { QueryFlashSaleDto } from './dto/query-flash-sale.dto';

@ApiTags('flash-sales')
@Controller('flash-sales')
export class FlashSalesController {
  constructor(private readonly flashSalesService: FlashSalesService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo flash sale' })
  create(@Body() dto: CreateFlashSaleDto) {
    return this.flashSalesService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Danh sách flash sale (phân trang/tìm kiếm/lọc/sắp xếp)' })
  findAll(@Query() query: QueryFlashSaleDto) {
    return this.flashSalesService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Chi tiết flash sale' })
  findOne(@Param('id') id: string) {
    return this.flashSalesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật flash sale (gửi items để thay toàn bộ danh sách sản phẩm sale)' })
  update(@Param('id') id: string, @Body() dto: UpdateFlashSaleDto) {
    return this.flashSalesService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Xoá flash sale' })
  remove(@Param('id') id: string) {
    return this.flashSalesService.remove(id);
  }
}
