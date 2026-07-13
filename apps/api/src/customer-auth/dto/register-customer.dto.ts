import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterCustomerDto {
  @ApiProperty({ example: 'Nguyễn Thị Mai' })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({ example: '0987654321' })
  @IsString()
  @MinLength(9)
  phone: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ example: 'MatKhau123' })
  @IsString()
  @MinLength(8)
  password: string;
}
