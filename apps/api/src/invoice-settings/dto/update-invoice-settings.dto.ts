import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateInvoiceSettingsDto {
  @ApiPropertyOptional({
    description: 'Tên pháp lý công ty (hiển thị trên hóa đơn)',
  })
  @IsOptional()
  @IsString()
  companyLegalName?: string;

  @ApiPropertyOptional({ description: 'Mã số thuế (MST)' })
  @IsOptional()
  @IsString()
  taxCode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  companyAddress?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  companyPhone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  companyEmail?: string;

  @ApiPropertyOptional({
    description:
      'Nhà cung cấp hóa đơn điện tử (VD: VIETTEL, VNPT, MISA, M-INVOICE) — chưa tích hợp API',
  })
  @IsOptional()
  @IsString()
  eInvoiceProvider?: string;

  @ApiPropertyOptional({
    description:
      'Endpoint API của nhà cung cấp hóa đơn điện tử — chưa tích hợp',
  })
  @IsOptional()
  @IsString()
  eInvoiceApiEndpoint?: string;

  @ApiPropertyOptional({
    description: 'API key của nhà cung cấp hóa đơn điện tử — chưa tích hợp',
  })
  @IsOptional()
  @IsString()
  eInvoiceApiKey?: string;

  @ApiPropertyOptional({
    description: 'API secret của nhà cung cấp hóa đơn điện tử — chưa tích hợp',
  })
  @IsOptional()
  @IsString()
  eInvoiceApiSecret?: string;

  @ApiPropertyOptional({ description: 'Mẫu số hóa đơn' })
  @IsOptional()
  @IsString()
  eInvoiceTemplateCode?: string;

  @ApiPropertyOptional({ description: 'Ký hiệu hóa đơn' })
  @IsOptional()
  @IsString()
  eInvoiceSeriesSymbol?: string;
}
