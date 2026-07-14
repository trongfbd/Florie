export interface InvoiceSettings {
  companyLegalName: string | null;
  taxCode: string | null;
  companyAddress: string | null;
  companyPhone: string | null;
  companyEmail: string | null;
  eInvoiceProvider: string | null;
  eInvoiceApiEndpoint: string | null;
  eInvoiceApiKey: string | null;
  eInvoiceApiSecret: string | null;
  eInvoiceTemplateCode: string | null;
  eInvoiceSeriesSymbol: string | null;
}

export type InvoiceSettingsFormInput = {
  [K in keyof InvoiceSettings]?: string;
};
