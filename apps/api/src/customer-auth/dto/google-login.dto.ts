import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class GoogleLoginDto {
  @ApiProperty({ description: 'The ID token returned by Google Identity Services on the client' })
  @IsString()
  idToken: string;
}
