import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class CreateCustomerNoteDto {
  @ApiProperty({ example: 'Khách thích hoa tone pastel, hay đặt dịp sinh nhật.' })
  @IsString()
  @MinLength(2)
  content: string;
}
