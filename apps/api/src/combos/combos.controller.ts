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
import { CombosService } from './combos.service';
import { CreateComboDto } from './dto/create-combo.dto';
import { UpdateComboDto } from './dto/update-combo.dto';
import { QueryComboDto } from './dto/query-combo.dto';

@ApiTags('combos')
@Controller('combos')
export class CombosController {
  constructor(private readonly combosService: CombosService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo combo' })
  create(@Body() dto: CreateComboDto) {
    return this.combosService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Danh sách combo (phân trang/tìm kiếm/lọc/sắp xếp)' })
  findAll(@Query() query: QueryComboDto) {
    return this.combosService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Chi tiết combo' })
  findOne(@Param('id') id: string) {
    return this.combosService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật combo (gửi items để thay toàn bộ danh sách sản phẩm trong combo)' })
  update(@Param('id') id: string, @Body() dto: UpdateComboDto) {
    return this.combosService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Xoá combo (chặn nếu đã có trong đơn hàng)' })
  remove(@Param('id') id: string) {
    return this.combosService.remove(id);
  }
}
