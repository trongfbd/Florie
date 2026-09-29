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
import { UserRole } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import type { AuthenticatedUser } from '../auth/types/jwt-payload.type';
import { MaterialsService } from './materials.service';
import { redactMaterialForRole } from './material-redaction.util';
import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';
import { QueryMaterialDto } from './dto/query-material.dto';
import { ImportMaterialDto } from './dto/import-material.dto';

// STAFF không cần vào trang Vật tư (chỉ Đơn hàng/Lịch giao hàng) — khoá cả
// controller, không chỉ ẩn menu phía frontend.
@Roles(UserRole.ADMIN, UserRole.OPERATIONS_ADMIN)
@ApiTags('materials')
@Controller('materials')
export class MaterialsController {
  constructor(private readonly materialsService: MaterialsService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo vật tư' })
  async create(
    @Body() dto: CreateMaterialDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const material = await this.materialsService.create(dto);
    return redactMaterialForRole(material, user.role);
  }

  @Get()
  @ApiOperation({
    summary: 'Danh sách vật tư (lọc theo loại/nhà cung cấp/sắp hết)',
  })
  async findAll(
    @Query() query: QueryMaterialDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const result = await this.materialsService.findAll(query);
    return {
      ...result,
      data: result.data.map((material) =>
        redactMaterialForRole(material, user.role),
      ),
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Chi tiết vật tư' })
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const material = await this.materialsService.findOne(id);
    return redactMaterialForRole(material, user.role);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật vật tư' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateMaterialDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const material = await this.materialsService.update(id, dto);
    return redactMaterialForRole(material, user.role);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Xoá vật tư (chặn nếu đang dùng trong BOM)' })
  remove(@Param('id') id: string) {
    return this.materialsService.remove(id);
  }

  @Post(':id/imports')
  @ApiOperation({ summary: 'Nhập kho — tăng tồn kho và ghi lịch sử nhập hàng' })
  async importStock(
    @Param('id') id: string,
    @Body() dto: ImportMaterialDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const material = await this.materialsService.importStock(id, dto);
    return redactMaterialForRole(material, user.role);
  }
}
