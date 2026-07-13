import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class TrackOrderDto {
  @ApiProperty({ example: 'FL20260713-0001' })
  @IsString()
  orderNumber: string;

  @ApiProperty({ example: '0987654321', description: 'Recipient phone used on the order' })
  @IsString()
  phone: string;
}
