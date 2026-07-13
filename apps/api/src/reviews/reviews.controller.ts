import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';
import { CustomerJwtAuthGuard } from '../customer-auth/guards/customer-jwt-auth.guard';
import { CurrentCustomer } from '../customer-auth/decorators/current-customer.decorator';
import type { AuthenticatedCustomer } from '../customer-auth/types/customer-jwt-payload.type';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';

@ApiTags('reviews')
@Controller('storefront/products/:slug/reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: '[Public] Danh sách đánh giá đã duyệt của sản phẩm' })
  list(@Param('slug') slug: string) {
    return this.reviewsService.listApproved(slug);
  }

  @Public()
  @UseGuards(CustomerJwtAuthGuard)
  @Post()
  @ApiOperation({ summary: 'Gửi đánh giá sản phẩm (yêu cầu đăng nhập)' })
  create(
    @Param('slug') slug: string,
    @CurrentCustomer() customer: AuthenticatedCustomer,
    @Body() dto: CreateReviewDto,
  ) {
    return this.reviewsService.create(slug, customer.id, dto);
  }
}
