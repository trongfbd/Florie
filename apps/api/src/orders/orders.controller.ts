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
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { QueryOrderDto } from './dto/query-order.dto';
import { ChangeOrderStatusDto } from './dto/change-order-status.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { AddOrderImageDto } from './dto/add-order-image.dto';

@ApiTags('orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo đơn hàng (giá/khuyến mãi tính ở server)' })
  create(@Body() dto: CreateOrderDto, @CurrentUser() user: AuthenticatedUser) {
    return this.ordersService.create(dto, user.id);
  }

  @Get()
  @ApiOperation({
    summary: 'Danh sách đơn hàng (phân trang/tìm kiếm/lọc/sắp xếp)',
  })
  findAll(@Query() query: QueryOrderDto) {
    return this.ordersService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Chi tiết đơn hàng (kèm timeline xử lý)' })
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Cập nhật thông tin giao hàng (chỉ khi đơn Mới/Đã xác nhận)',
  })
  update(@Param('id') id: string, @Body() dto: UpdateOrderDto) {
    return this.ordersService.update(id, dto);
  }

  @Patch(':id/status')
  @ApiOperation({
    summary:
      'Chuyển trạng thái đơn hàng — tự trừ/hoàn kho và cập nhật khách hàng khi cần',
  })
  changeStatus(
    @Param('id') id: string,
    @Body() dto: ChangeOrderStatusDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.ordersService.changeStatus(id, dto, user.id);
  }

  @Patch(':id/payment')
  @ApiOperation({
    summary:
      'Cập nhật trạng thái thanh toán thủ công (Đã cọc/Đã thanh toán đủ)',
  })
  updatePayment(@Param('id') id: string, @Body() dto: UpdatePaymentDto) {
    return this.ordersService.updatePayment(id, dto);
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
