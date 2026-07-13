-- AlterTable
ALTER TABLE "Popup" ADD COLUMN     "returningCustomerMinOrders" INTEGER,
ADD COLUMN     "showToNewCustomers" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "voucherId" TEXT;

-- CreateTable
CREATE TABLE "VoucherClaim" (
    "id" TEXT NOT NULL,
    "voucherId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "popupId" TEXT,
    "claimedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VoucherClaim_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VoucherClaim_customerId_idx" ON "VoucherClaim"("customerId");

-- CreateIndex
CREATE UNIQUE INDEX "VoucherClaim_voucherId_customerId_key" ON "VoucherClaim"("voucherId", "customerId");

-- AddForeignKey
ALTER TABLE "Popup" ADD CONSTRAINT "Popup_voucherId_fkey" FOREIGN KEY ("voucherId") REFERENCES "Voucher"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoucherClaim" ADD CONSTRAINT "VoucherClaim_voucherId_fkey" FOREIGN KEY ("voucherId") REFERENCES "Voucher"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoucherClaim" ADD CONSTRAINT "VoucherClaim_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoucherClaim" ADD CONSTRAINT "VoucherClaim_popupId_fkey" FOREIGN KEY ("popupId") REFERENCES "Popup"("id") ON DELETE SET NULL ON UPDATE CASCADE;
