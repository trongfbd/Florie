import {
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  HttpCode,
  HttpStatus,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/types/jwt-payload.type';
import { ProductsService } from './products.service';
import { redactProductForRole } from './product-redaction.util';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto } from './dto/query-product.dto';
import { AddProductImageDto } from './dto/add-product-image.dto';
import { SetProductMaterialsDto } from './dto/set-product-materials.dto';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo sản phẩm' })
  async create(
    @Body() dto: CreateProductDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const product = await this.productsService.create(dto);
    return redactProductForRole(product, user.role);
  }

  @Get()
  @ApiOperation({
    summary: 'Danh sách sản phẩm (phân trang/tìm kiếm/lọc/sắp xếp)',
  })
  async findAll(
    @Query() query: QueryProductDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const result = await this.productsService.findAll(query);
    return {
      ...result,
      data: result.data.map((product) =>
        redactProductForRole(product, user.role),
      ),
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Chi tiết sản phẩm' })
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const product = await this.productsService.findOne(id);
    return redactProductForRole(product, user.role);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật sản phẩm' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const product = await this.productsService.update(id, dto);
    return redactProductForRole(product, user.role);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Xoá sản phẩm (chặn nếu đã có trong đơn hàng)' })
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }

  @Post(':id/images')
  @ApiOperation({ summary: 'Thêm ảnh sản phẩm' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  addImage(
    @Param('id') id: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: /^image\/(jpeg|png|webp)$/ }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Body() dto: AddProductImageDto,
  ) {
    return this.productsService.addImage(id, file, dto.altText);
  }

  @Delete(':id/images/:imageId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Xoá ảnh sản phẩm' })
  removeImage(@Param('id') id: string, @Param('imageId') imageId: string) {
    return this.productsService.removeImage(id, imageId);
  }

  @Patch(':id/materials')
  @ApiOperation({
    summary: 'Thiết lập công thức bó hoa (BOM) — thay toàn bộ danh sách',
  })
  setMaterials(@Param('id') id: string, @Body() dto: SetProductMaterialsDto) {
    return this.productsService.setMaterials(id, dto);
  }
}
