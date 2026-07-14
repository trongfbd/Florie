import { Body, Controller, Get, Patch } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { InvoiceSettingsService } from './invoice-settings.service';
import { UpdateInvoiceSettingsDto } from './dto/update-invoice-settings.dto';

@ApiTags('invoice-settings')
@Controller('invoice-settings')
export class InvoiceSettingsController {
  constructor(
    private readonly invoiceSettingsService: InvoiceSettingsService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Xem cấu hình công ty/thuế/hóa đơn điện tử hiện tại',
  })
  get() {
    return this.invoiceSettingsService.get();
  }

  @Patch()
  @ApiOperation({ summary: 'Cập nhật cấu hình công ty/thuế/hóa đơn điện tử' })
  update(@Body() dto: UpdateInvoiceSettingsDto) {
    return this.invoiceSettingsService.update(dto);
  }
}
