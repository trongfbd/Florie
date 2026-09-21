-- CreateEnum
CREATE TYPE "OrderChannel" AS ENUM ('WEB', 'ZALO', 'FACEBOOK', 'TIKTOK', 'PHONE', 'WALK_IN', 'B2B');

-- CreateEnum
CREATE TYPE "OrderImageKind" AS ENUM ('REFERENCE');

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "channel" "OrderChannel" NOT NULL DEFAULT 'WEB',
ADD COLUMN     "deliveryDistrict" TEXT,
ADD COLUMN     "depositAmount" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "OrderImage" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "storageKey" TEXT,
    "altText" TEXT,
    "kind" "OrderImageKind" NOT NULL DEFAULT 'REFERENCE',
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OrderImage_orderId_idx" ON "OrderImage"("orderId");

-- CreateIndex
CREATE INDEX "Order_channel_idx" ON "Order"("channel");

-- AddForeignKey
ALTER TABLE "OrderImage" ADD CONSTRAINT "OrderImage_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
