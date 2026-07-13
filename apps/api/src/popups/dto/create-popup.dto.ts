import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class CreatePopupDto {
  @ApiProperty({ example: 'Ưu đãi khai trương' })
  @IsString()
  @MinLength(2)
  title: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  linkUrl?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  startAt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  endAt?: string;

  @ApiPropertyOptional({
    description: 'Voucher gắn với popup này — popup chỉ hiển thị công khai khi voucher này đang hoạt động',
  })
  @IsOptional()
  @IsString()
  voucherId?: string;

  @ApiPropertyOptional({ default: true, description: 'Hiển thị cho khách hàng mới (chưa từng đặt đơn)' })
  @IsOptional()
  @IsBoolean()
  showToNewCustomers?: boolean;

  @ApiPropertyOptional({
    description: 'Hiển thị cho khách cũ đã đặt từ N đơn trở lên — để trống nếu không áp dụng cho khách cũ',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  returningCustomerMinOrders?: number;
}
