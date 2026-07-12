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
import { MaterialsService } from './materials.service';
import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';
import { QueryMaterialDto } from './dto/query-material.dto';
import { ImportMaterialDto } from './dto/import-material.dto';

@ApiTags('materials')
@Controller('materials')
export class MaterialsController {
  constructor(private readonly materialsService: MaterialsService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo vật tư' })
  create(@Body() dto: CreateMaterialDto) {
    return this.materialsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Danh sách vật tư (lọc theo loại/nhà cung cấp/sắp hết)' })
  findAll(@Query() query: QueryMaterialDto) {
    return this.materialsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Chi tiết vật tư' })
  findOne(@Param('id') id: string) {
    return this.materialsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật vật tư' })
  update(@Param('id') id: string, @Body() dto: UpdateMaterialDto) {
    return this.materialsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Xoá vật tư (chặn nếu đang dùng trong BOM)' })
  remove(@Param('id') id: string) {
    return this.materialsService.remove(id);
  }

  @Post(':id/imports')
  @ApiOperation({ summary: 'Nhập kho — tăng tồn kho và ghi lịch sử nhập hàng' })
  importStock(@Param('id') id: string, @Body() dto: ImportMaterialDto) {
    return this.materialsService.importStock(id, dto);
  }
}
