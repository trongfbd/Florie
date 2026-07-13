import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class ChatMessageDto {
  @ApiProperty({ example: 'Doanh thu tuần này thế nào?' })
  @IsString()
  @MinLength(1)
  message: string;
}
