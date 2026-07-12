import { ConflictException, Injectable } from '@nestjs/common';
import { NotificationType, Prisma } from '@prisma/client';

type PrismaTx = Prisma.TransactionClient;

export interface OrderMaterialSource {
  productId: string | null;
  comboId: string | null;
  quantity: number;
}

/**
 * Aggregates and applies material (BOM) requirements for an order's line
 * items, expanding combos into their constituent products. Kept independent
 * of OrdersService's transaction so callers can run it inside their own
 * prisma.$transaction alongside status/customer updates.
 */
@Injectable()
export class InventoryService {
  async getRequiredMaterials(
    items: OrderMaterialSource[],
    tx: PrismaTx,
  ): Promise<Map<string, Prisma.Decimal>> {
    const requirements = new Map<string, Prisma.Decimal>();

    const addRequirement = (materialId: string, amount: Prisma.Decimal) => {
      const existing = requirements.get(materialId);
      requirements.set(materialId, existing ? existing.plus(amount) : amount);
    };

    for (const item of items) {
      if (item.productId) {
        const boms = await tx.productMaterial.findMany({ where: { productId: item.productId } });
        for (const bom of boms) {
          addRequirement(bom.materialId, bom.quantity.times(item.quantity));
        }
      } else if (item.comboId) {
        const comboItems = await tx.comboItem.findMany({ where: { comboId: item.comboId } });
        for (const comboItem of comboItems) {
          const boms = await tx.productMaterial.findMany({
            where: { productId: comboItem.productId },
          });
          for (const bom of boms) {
            addRequirement(
              bom.materialId,
              bom.quantity.times(comboItem.quantity).times(item.quantity),
            );
          }
        }
      }
    }

    return requirements;
  }

  /** Throws ConflictException (listing shortages) if stock is insufficient — deducts nothing in that case. */
  async deductForOrder(items: OrderMaterialSource[], tx: PrismaTx): Promise<void> {
    const requirements = await this.getRequiredMaterials(items, tx);
    if (requirements.size === 0) {
      return;
    }

    const materials = await tx.material.findMany({
      where: { id: { in: [...requirements.keys()] } },
    });

    const shortages: string[] = [];
    for (const [materialId, required] of requirements) {
      const material = materials.find((m) => m.id === materialId);
      if (!material || material.stockQuantity.lessThan(required)) {
        shortages.push(
          `${material?.name ?? materialId} (cần ${required.toString()}, còn ${material?.stockQuantity.toString() ?? '0'} ${material?.unit ?? ''})`,
        );
      }
    }

    if (shortages.length > 0) {
      throw new ConflictException(`Không đủ nguyên vật liệu trong kho: ${shortages.join('; ')}`);
    }

    for (const [materialId, required] of requirements) {
      await tx.material.update({
        where: { id: materialId },
        data: { stockQuantity: { decrement: required.toNumber() } },
      });
    }

    await this.notifyLowStock([...requirements.keys()], tx);
  }

  async restockForOrder(items: OrderMaterialSource[], tx: PrismaTx): Promise<void> {
    const requirements = await this.getRequiredMaterials(items, tx);
    for (const [materialId, amount] of requirements) {
      await tx.material.update({
        where: { id: materialId },
        data: { stockQuantity: { increment: amount.toNumber() } },
      });
    }
  }

  private async notifyLowStock(materialIds: string[], tx: PrismaTx): Promise<void> {
    const materials = await tx.material.findMany({ where: { id: { in: materialIds } } });

    for (const material of materials) {
      if (material.stockQuantity.lessThanOrEqualTo(material.minStockThreshold)) {
        await tx.notification.create({
          data: {
            type: NotificationType.LOW_STOCK,
            title: 'Vật tư sắp hết',
            message: `${material.name} chỉ còn ${material.stockQuantity.toString()} ${material.unit}`,
            relatedEntityId: material.id,
          },
        });
      }
    }
  }
}
