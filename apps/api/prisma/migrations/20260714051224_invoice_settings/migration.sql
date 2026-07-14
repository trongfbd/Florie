-- CreateTable
CREATE TABLE "InvoiceSettings" (
    "id" TEXT NOT NULL,
    "companyLegalName" TEXT,
    "taxCode" TEXT,
    "companyAddress" TEXT,
    "companyPhone" TEXT,
    "companyEmail" TEXT,
    "eInvoiceProvider" TEXT,
    "eInvoiceApiEndpoint" TEXT,
    "eInvoiceApiKey" TEXT,
    "eInvoiceApiSecret" TEXT,
    "eInvoiceTemplateCode" TEXT,
    "eInvoiceSeriesSymbol" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InvoiceSettings_pkey" PRIMARY KEY ("id")
);
