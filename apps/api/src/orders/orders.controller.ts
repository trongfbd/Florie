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
import { UserRole } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import type { AuthenticatedUser } from '../auth/types/jwt-payload.type';
import { OrdersService } from './orders.service';
import { redactOrderForRole } from './order-redaction.util';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { QueryOrderDto } from './dto/query-order.dto';
import { ChangeOrderStatusDto } from './dto/change-order-status.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { UpdateItemCostPriceDto } from './dto/update-item-cost-price.dto';
import { UpdateShippingFeeDto } from './dto/update-shipping-fee.dto';
import { AddOrderImageDto } from './dto/add-order-image.dto';

@ApiTags('orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.OPERATIONS_ADMIN)
  @ApiOperation({ summary: 'Tạo đơn hàng (giá/khuyến mãi tính ở server)' })
  async create(
    @Body() dto: CreateOrderDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const order = await this.ordersService.create(dto, user.id, user.role);
    return redactOrderForRole(order, user.role);
  }

  @Get()
  @ApiOperation({
    summary: 'Danh sách đơn hàng (phân trang/tìm kiếm/lọc/sắp xếp)',
  })
  async findAll(
    @Query() query: QueryOrderDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const result = await this.ordersService.findAll(query);
    return {
      ...result,
      data: result.data.map((order) => redactOrderForRole(order, user.role)),
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Chi tiết đơn hàng (kèm timeline xử lý)' })
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const order = await this.ordersService.findOne(id);
    return redactOrderForRole(order, user.role);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.OPERATIONS_ADMIN)
  @ApiOperation({
    summary: 'Cập nhật thông tin giao hàng (chỉ khi đơn Mới/Đã xác nhận)',
  })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateOrderDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const order = await this.ordersService.update(id, dto);
    return redactOrderForRole(order, user.role);
  }

  @Patch(':id/status')
  @ApiOperation({
    summary:
      'Chuyển trạng thái đơn hàng — tự trừ/hoàn kho và cập nhật khách hàng khi cần',
  })
  async changeStatus(
    @Param('id') id: string,
    @Body() dto: ChangeOrderStatusDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const order = await this.ordersService.changeStatus(
      id,
      dto,
      user.id,
      user.role,
    );
    return redactOrderForRole(order, user.role);
  }

  @Patch(':id/payment')
  @Roles(UserRole.ADMIN, UserRole.OPERATIONS_ADMIN)
  @ApiOperation({
    summary:
      'Cập nhật trạng thái thanh toán thủ công (Đã cọc/Đã thanh toán đủ)',
  })
  async updatePayment(
    @Param('id') id: string,
    @Body() dto: UpdatePaymentDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const order = await this.ordersService.updatePayment(id, dto);
    return redactOrderForRole(order, user.role);
  }

  @Patch(':id/shipping-fee')
  @Roles(UserRole.ADMIN, UserRole.OPERATIONS_ADMIN)
  @ApiOperation({
    summary:
      'Sửa phí ship thực tế (VD: sau khi book Grab) — tự tính lại total, khoá khi đơn đã Đã giao/Đã huỷ',
  })
  async updateShippingFee(
    @Param('id') id: string,
    @Body() dto: UpdateShippingFeeDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const order = await this.ordersService.updateShippingFee(
      id,
      dto.shippingFee,
    );
    return redactOrderForRole(order, user.role);
  }

  @Patch(':id/items/:itemId/cost-price')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary:
      'Bổ sung/sửa giá gốc cho 1 mục trong đơn — không phụ thuộc trạng thái đơn',
  })
  updateItemCostPrice(
    @Param('id') id: string,
    @Param('itemId') itemId: string,
    @Body() dto: UpdateItemCostPriceDto,
  ) {
    return this.ordersService.updateItemCostPrice(id, itemId, dto.costPrice);
  }

  @Post(':id/images')
  @ApiOperation({ summary: 'Thêm ảnh tham khảo cho đơn hàng' })
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
    @Body() dto: AddOrderImageDto,
  ) {
    return this.ordersService.addImage(id, file, dto.altText);
  }

  @Delete(':id/images/:imageId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Xoá ảnh tham khảo của đơn hàng' })
  removeImage(@Param('id') id: string, @Param('imageId') imageId: string) {
    return this.ordersService.removeImage(id, imageId);
  }
}
