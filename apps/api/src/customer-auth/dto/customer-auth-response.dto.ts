import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';

export class CustomerProfileDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  phone: string;

  @ApiPropertyOptional()
  email: string | null;
}

export class CustomerAuthResponseDto {
  @ApiProperty()
  accessToken: string;

  @ApiProperty({ type: CustomerProfileDto })
  customer: CustomerProfileDto;
}
