import { PrismaClient, MaterialType, OrderStatus, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const PASSWORD_SALT_ROUNDS = 10;

async function main() {
  console.log('Seeding Bèo Flower Corner database...');

  // --- Users (Admin / Staff) ---
  const adminPasswordHash = await bcrypt.hash('Florie@Admin123', PASSWORD_SALT_ROUNDS);
  const staffPasswordHash = await bcrypt.hash('Florie@Staff123', PASSWORD_SALT_ROUNDS);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@florie.vn' },
    update: {},
    create: {
      email: 'admin@florie.vn',
      passwordHash: adminPasswordHash,
      name: 'Bèo Flower Corner Admin',
      role: UserRole.ADMIN,
    },
  });

  await prisma.user.upsert({
    where: { email: 'staff@florie.vn' },
    update: {},
    create: {
      email: 'staff@florie.vn',
      passwordHash: staffPasswordHash,
      name: 'Bèo Flower Corner Staff',
      role: UserRole.STAFF,
    },
  });

  // --- Supplier ---
  const supplier = await prisma.supplier.create({
    data: {
      name: 'Chợ hoa Quảng An',
      phone: '0901234567',
      address: 'Quảng An, Tây Hồ, Hà Nội',
    },
  });

  // --- Materials ---
  const [rose, baby, kraftPaper, ribbon, card] = await Promise.all([
    prisma.material.create({
      data: {
        name: 'Hoa hồng đỏ Ecuador',
        type: MaterialType.FLOWER,
        unit: 'bông',
        stockQuantity: 500,
        minStockThreshold: 50,
        latestCostPrice: 15000,
        supplierId: supplier.id,
      },
    }),
    prisma.material.create({
      data: {
        name: 'Hoa baby trắng',
        type: MaterialType.FLOWER,
        unit: 'cành',
        stockQuantity: 100,
        minStockThreshold: 20,
        latestCostPrice: 8000,
        supplierId: supplier.id,
      },
    }),
    prisma.material.create({
      data: {
        name: 'Giấy Kraft',
        type: MaterialType.PAPER,
        unit: 'tờ',
        stockQuantity: 200,
        minStockThreshold: 30,
        latestCostPrice: 5000,
        supplierId: supplier.id,
      },
    }),
    prisma.material.create({
      data: {
        name: 'Ruy băng lụa đỏ',
        type: MaterialType.RIBBON,
        unit: 'mét',
        stockQuantity: 150,
        minStockThreshold: 20,
        latestCostPrice: 3000,
        supplierId: supplier.id,
      },
    }),
    prisma.material.create({
      data: {
        name: 'Thiệp chúc mừng',
        type: MaterialType.CARD,
        unit: 'cái',
        stockQuantity: 300,
        minStockThreshold: 50,
        latestCostPrice: 4000,
        supplierId: supplier.id,
      },
    }),
  ]);

  await prisma.materialImportLog.create({
    data: {
      materialId: rose.id,
      supplierId: supplier.id,
      quantity: 500,
      unitCost: 15000,
      note: 'Nhập hàng đầu kỳ',
    },
  });

  // --- Category ---
  const birthdayCategory = await prisma.category.create({
    data: {
      name: 'Hoa Sinh Nhật',
      slug: 'hoa-sinh-nhat',
      description: 'Các mẫu hoa dành tặng sinh nhật',
      seoTitle: 'Hoa Sinh Nhật Đẹp - Bèo Flower Corner',
      seoDescription: 'Bó hoa sinh nhật tươi, giao trong ngày.',
      displayOrder: 1,
    },
  });

  // --- Tag (Occasion) ---
  const birthdayTag = await prisma.tag.create({
    data: { name: 'Sinh nhật', slug: 'sinh-nhat', type: 'OCCASION' },
  });

  // --- Product with BOM ---
  const loveRose = await prisma.product.create({
    data: {
      name: 'Love Rose',
      slug: 'love-rose',
      description: 'Bó 20 hoa hồng đỏ phối baby, gói giấy Kraft sang trọng.',
      categoryId: birthdayCategory.id,
      basePrice: 650000,
      salePrice: 590000,
      color: 'Đỏ',
      status: 'ACTIVE',
      seoTitle: 'Love Rose - Bó Hoa Hồng Đỏ Sinh Nhật',
      seoDescription: 'Love Rose - bó 20 hoa hồng đỏ Ecuador, quà tặng sinh nhật ý nghĩa.',
      images: {
        create: [{ url: '/products/love-rose-1.jpg', altText: 'Love Rose', displayOrder: 0 }],
      },
      tags: { create: [{ tagId: birthdayTag.id }] },
      materials: {
        create: [
          { materialId: rose.id, quantity: 20 },
          { materialId: baby.id, quantity: 3 },
          { materialId: kraftPaper.id, quantity: 1 },
          { materialId: ribbon.id, quantity: 2 },
          { materialId: card.id, quantity: 1 },
        ],
      },
    },
  });

  // --- Voucher ---
  await prisma.voucher.create({
    data: {
      code: 'FLORIE10',
      description: 'Giảm 10% cho đơn đầu tiên',
      discountType: 'PERCENTAGE',
      discountValue: 10,
      minOrderValue: 300000,
      maxDiscountAmount: 100000,
      usageLimit: 100,
      startAt: new Date('2026-01-01'),
      endAt: new Date('2026-12-31'),
    },
  });

  // --- Customer ---
  const customer = await prisma.customer.create({
    data: {
      name: 'Nguyễn Thị Mai',
      phone: '0987654321',
      email: 'mai.nguyen@example.com',
      addresses: {
        create: [
          {
            recipientName: 'Nguyễn Thị Mai',
            phone: '0987654321',
            addressLine: '12 Ngõ 5, Đường Láng',
            ward: 'Láng Thượng',
            district: 'Đống Đa',
            province: 'Hà Nội',
            isDefault: true,
          },
        ],
      },
    },
  });

  // --- Sample completed order (end-to-end proof) ---
  const order = await prisma.order.create({
    data: {
      orderNumber: 'FL20260712-0001',
      customerId: customer.id,
      recipientName: 'Nguyễn Thị Mai',
      recipientPhone: '0987654321',
      deliveryAddress: '12 Ngõ 5, Đường Láng, Đống Đa, Hà Nội',
      deliveryDate: new Date('2026-07-13T09:00:00Z'),
      deliveryTime: '09:00 - 11:00',
      cardMessage: 'Chúc mừng sinh nhật!',
      status: OrderStatus.COMPLETED,
      paymentMethod: 'COD',
      paymentStatus: 'PAID',
      subtotal: 590000,
      shippingFee: 30000,
      discountAmount: 0,
      total: 620000,
      source: 'FACEBOOK',
      createdById: admin.id,
      items: {
        create: [
          {
            productId: loveRose.id,
            itemName: loveRose.name,
            quantity: 1,
            unitPrice: 590000,
            subtotal: 590000,
          },
        ],
      },
      statusHistory: {
        create: [
          { toStatus: OrderStatus.NEW, changedById: admin.id, note: 'Khách đặt qua Facebook' },
          { fromStatus: OrderStatus.NEW, toStatus: OrderStatus.CONFIRMED, changedById: admin.id },
          {
            fromStatus: OrderStatus.CONFIRMED,
            toStatus: OrderStatus.ARRANGING,
            changedById: admin.id,
          },
          {
            fromStatus: OrderStatus.ARRANGING,
            toStatus: OrderStatus.SHIPPING,
            changedById: admin.id,
          },
          {
            fromStatus: OrderStatus.SHIPPING,
            toStatus: OrderStatus.COMPLETED,
            changedById: admin.id,
          },
        ],
      },
    },
  });

  await prisma.customer.update({
    where: { id: customer.id },
    data: { totalSpent: order.total },
  });

  console.log('Seed completed:', {
    users: 2,
    supplier: supplier.name,
    materials: 5,
    category: birthdayCategory.name,
    product: loveRose.name,
    customer: customer.name,
    order: order.orderNumber,
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
