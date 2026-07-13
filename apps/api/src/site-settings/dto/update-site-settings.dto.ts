import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateSiteSettingsDto {
  @ApiPropertyOptional({ description: 'Facebook Pixel ID' })
  @IsOptional()
  @IsString()
  facebookPixelId?: string;

  @ApiPropertyOptional({ description: 'Google Analytics 4 Measurement ID (G-XXXXXXX)' })
  @IsOptional()
  @IsString()
  googleAnalyticsId?: string;

  @ApiPropertyOptional({ description: 'Google Tag Manager Container ID (GTM-XXXXXXX)' })
  @IsOptional()
  @IsString()
  googleTagManagerId?: string;
}
