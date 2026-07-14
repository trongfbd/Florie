import { Injectable } from '@nestjs/common';
import { InvoiceSettings } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateInvoiceSettingsDto } from './dto/update-invoice-settings.dto';

/**
 * Singleton config row (company/tax info + e-invoice provider placeholders),
 * same lazy-create-on-first-access pattern as SiteSettingsService.
 */
@Injectable()
export class InvoiceSettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async get(): Promise<InvoiceSettings> {
    const existing = await this.prisma.invoiceSettings.findFirst();
    if (existing) {
      return existing;
    }
    return this.prisma.invoiceSettings.create({ data: {} });
  }

  async update(dto: UpdateInvoiceSettingsDto): Promise<InvoiceSettings> {
    const current = await this.get();
    return this.prisma.invoiceSettings.update({
      where: { id: current.id },
      data: dto,
    });
  }
}
