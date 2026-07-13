import { Injectable } from '@nestjs/common';
import { SiteSettings } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateSiteSettingsDto } from './dto/update-site-settings.dto';

/**
 * Singleton config row (pixel/analytics IDs). There is intentionally no create/list/delete —
 * `get()` lazily creates the one row on first access, `update()` always targets it.
 */
@Injectable()
export class SiteSettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async get(): Promise<SiteSettings> {
    const existing = await this.prisma.siteSettings.findFirst();
    if (existing) {
      return existing;
    }
    return this.prisma.siteSettings.create({ data: {} });
  }

  async update(dto: UpdateSiteSettingsDto): Promise<SiteSettings> {
    const current = await this.get();
    return this.prisma.siteSettings.update({ where: { id: current.id }, data: dto });
  }
}
