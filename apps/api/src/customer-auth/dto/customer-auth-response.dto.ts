import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';

export class CustomerProfileDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  phone: string | null;

  @ApiPropertyOptional()
  email: string | null;

  @ApiPropertyOptional()
  avatarUrl: string | null;
}

export class CustomerAuthResponseDto {
  @ApiProperty()
  accessToken: string;

  @ApiProperty({ type: CustomerProfileDto })
  customer: CustomerProfileDto;
}
