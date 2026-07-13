import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';
import { CustomerJwtAuthGuard } from '../customer-auth/guards/customer-jwt-auth.guard';
import { CurrentCustomer } from '../customer-auth/decorators/current-customer.decorator';
import type { AuthenticatedCustomer } from '../customer-auth/types/customer-jwt-payload.type';
import { WishlistService } from './wishlist.service';
import { AddWishlistItemDto } from './dto/add-wishlist-item.dto';

@ApiTags('wishlist')
@Public()
@UseGuards(CustomerJwtAuthGuard)
@Controller('storefront/wishlist')
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Get()
  @ApiOperation({ summary: 'Danh sách sản phẩm yêu thích của khách đang đăng nhập' })
  list(@CurrentCustomer() customer: AuthenticatedCustomer) {
    return this.wishlistService.list(customer.id);
  }

  @Post()
  @ApiOperation({ summary: 'Thêm sản phẩm vào wishlist' })
  add(@CurrentCustomer() customer: AuthenticatedCustomer, @Body() dto: AddWishlistItemDto) {
    return this.wishlistService.add(customer.id, dto.productId);
  }

  @Delete(':productId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Gỡ sản phẩm khỏi wishlist' })
  remove(@CurrentCustomer() customer: AuthenticatedCustomer, @Param('productId') productId: string) {
    return this.wishlistService.remove(customer.id, productId);
  }
}
