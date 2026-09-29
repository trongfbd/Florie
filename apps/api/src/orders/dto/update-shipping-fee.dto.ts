import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, Min } from 'class-validator';

export class UpdateShippingFeeDto {
  @ApiProperty({
    description: 'VND — phí ship thực tế, ví dụ sau khi book Grab',
  })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  shippingFee: number;
}
