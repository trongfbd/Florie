import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';
import { CategoriesService } from '../categories/categories.service';
import { ProductsService } from '../products/products.service';
import { QueryPublicProductDto } from '../products/dto/query-public-product.dto';
import { CombosService } from '../combos/combos.service';
import { FlashSalesService } from '../flash-sales/flash-sales.service';
import { BannersService } from '../banners/banners.service';
import { BlogsService } from '../blogs/blogs.service';
import { PopupsService } from '../popups/popups.service';
import { QueryBlogDto } from '../blogs/dto/query-blog.dto';
import { BannerPosition } from '@prisma/client';

@ApiTags('storefront')
@Public()
@Controller('storefront')
export class StorefrontController {
  constructor(
    private readonly categoriesService: CategoriesService,
    private readonly productsService: ProductsService,
    private readonly combosService: CombosService,
    private readonly flashSalesService: FlashSalesService,
    private readonly bannersService: BannersService,
    private readonly blogsService: BlogsService,
    private readonly popupsService: PopupsService,
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

  @Get('combos')
  @ApiOperation({ summary: '[Public] Danh sách combo đang bán' })
  findCombos() {
    return this.combosService.findPublicList();
  }

  @Get('combos/:slug')
  @ApiOperation({ summary: '[Public] Chi tiết combo theo slug' })
  findCombo(@Param('slug') slug: string) {
    return this.combosService.findPublicBySlug(slug);
  }

  @Get('flash-sale')
  @ApiOperation({ summary: '[Public] Flash sale đang diễn ra (null nếu không có)' })
  findActiveFlashSale() {
    return this.flashSalesService.findActive();
  }

  @Get('banners')
  @ApiOperation({ summary: '[Public] Banner đang hoạt động theo vị trí' })
  findBanners(@Query('position') position: BannerPosition = BannerPosition.HOME) {
    return this.bannersService.findPublicByPosition(position);
  }

  @Get('blogs')
  @ApiOperation({ summary: '[Public] Danh sách bài viết đã xuất bản (phân trang/tìm kiếm)' })
  findBlogs(@Query() query: QueryBlogDto) {
    return this.blogsService.findPublicList(query);
  }

  @Get('blogs/:slug')
  @ApiOperation({ summary: '[Public] Chi tiết bài viết theo slug' })
  findBlog(@Param('slug') slug: string) {
    return this.blogsService.findPublicBySlug(slug);
  }

  @Get('popup')
  @ApiOperation({ summary: '[Public] Popup đang hoạt động (null nếu không có)' })
  findActivePopup() {
    return this.popupsService.findActive();
  }
}
