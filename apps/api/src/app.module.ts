import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { StorageModule } from './storage/storage.module';
import { UploadsModule } from './uploads/uploads.module';
import { CategoriesModule } from './categories/categories.module';
import { ProductsModule } from './products/products.module';
import { SuppliersModule } from './suppliers/suppliers.module';
import { MaterialsModule } from './materials/materials.module';
import { InventoryModule } from './inventory/inventory.module';
import { OrdersModule } from './orders/orders.module';
import { StorefrontModule } from './storefront/storefront.module';
import { CustomersModule } from './customers/customers.module';
import { CustomerAuthModule } from './customer-auth/customer-auth.module';
import { StorefrontOrdersModule } from './storefront-orders/storefront-orders.module';
import { WishlistModule } from './wishlist/wishlist.module';
import { ReviewsModule } from './reviews/reviews.module';
import { VouchersModule } from './vouchers/vouchers.module';
import { CombosModule } from './combos/combos.module';
import { FlashSalesModule } from './flash-sales/flash-sales.module';
import { BannersModule } from './banners/banners.module';
import { BlogsModule } from './blogs/blogs.module';
import { PopupsModule } from './popups/popups.module';
import { SiteSettingsModule } from './site-settings/site-settings.module';
import { ExpensesModule } from './expenses/expenses.module';
import { ReportsModule } from './reports/reports.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 20 }]),
    PrismaModule,
    StorageModule,
    HealthModule,
    UsersModule,
    AuthModule,
    UploadsModule,
    CategoriesModule,
    ProductsModule,
    SuppliersModule,
    MaterialsModule,
    InventoryModule,
    OrdersModule,
    StorefrontModule,
    CustomersModule,
    CustomerAuthModule,
    StorefrontOrdersModule,
    WishlistModule,
    ReviewsModule,
    VouchersModule,
    CombosModule,
    FlashSalesModule,
    BannersModule,
    BlogsModule,
    PopupsModule,
    SiteSettingsModule,
    ExpensesModule,
    ReportsModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
