import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class SetVipDto {
  @ApiProperty()
  @IsBoolean()
  isVip: boolean;
}
