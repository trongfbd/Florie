import { Body, Controller, Get, Patch } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';
import { SiteSettingsService } from './site-settings.service';
import { UpdateSiteSettingsDto } from './dto/update-site-settings.dto';

@ApiTags('site-settings')
@Controller('site-settings')
export class SiteSettingsController {
  constructor(private readonly siteSettingsService: SiteSettingsService) {}

  @Get()
  @ApiOperation({ summary: 'Xem cấu hình pixel/analytics hiện tại' })
  get() {
    return this.siteSettingsService.get();
  }

  @Patch()
  @ApiOperation({ summary: 'Cập nhật cấu hình pixel/analytics' })
  update(@Body() dto: UpdateSiteSettingsDto) {
    return this.siteSettingsService.update(dto);
  }

  @Public()
  @Get('public')
  @ApiOperation({ summary: '[Public] Pixel/analytics ID để nhúng script ở storefront' })
  getPublic() {
    return this.siteSettingsService.get();
  }
}
