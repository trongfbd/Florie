import { ApiProperty } from '@nestjs/swagger';

export class UploadResponseDto {
  @ApiProperty()
  key: string;

  @ApiProperty()
  url: string;
}
