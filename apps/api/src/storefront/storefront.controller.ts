import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';
import { CategoriesService } from '../categories/categories.service';
import { ProductsService } from '../products/products.service';
import { QueryPublicProductDto } from '../products/dto/query-public-product.dto';

@ApiTags('storefront')
@Public()
@Controller('storefront')
export class StorefrontController {
  constructor(
    private readonly categoriesService: CategoriesService,
    private readonly productsService: ProductsService,
  ) {}

  @Get('categories')
  @ApiOperation({ summary: '[Public] Danh sách danh mục đang hoạt động' })
  findCategories() {
    return this.categoriesService.findPublicList();
  }

  @Get('categories/:slug')
  @ApiOperation({ summary: '[Public] Chi tiết danh mục theo slug' })
  findCategory(@Param('slug') slug: string) {
    return this.categoriesService.findPublicBySlug(slug);
  }

  @Get('products')
  @ApiOperation({ summary: '[Public] Danh sách sản phẩm đang bán (phân trang/tìm kiếm/lọc/sắp xếp)' })
  findProducts(@Query() query: QueryPublicProductDto) {
    return this.productsService.findPublicList(query);
  }

  @Get('products/:slug')
  @ApiOperation({ summary: '[Public] Chi tiết sản phẩm theo slug' })
  findProduct(@Param('slug') slug: string) {
    return this.productsService.findPublicBySlug(slug);
  }

  @Get('products/:slug/related')
  @ApiOperation({ summary: '[Public] Sản phẩm liên quan (cùng danh mục)' })
  findRelatedProducts(@Param('slug') slug: string) {
    return this.productsService.findRelatedProducts(slug);
  }
}
