import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, Min } from 'class-validator';

export class ValidateVoucherDto {
  @ApiProperty({ example: 'FLORIE10' })
  @IsString()
  code: string;

  @ApiProperty({ description: 'Tổng tiền hàng trước giảm giá (VND)' })
  @IsInt()
  @Min(0)
  subtotal: number;
}
