import { Module } from '@nestjs/common';
import { CategoriesModule } from '../categories/categories.module';
import { ProductsModule } from '../products/products.module';
import { CombosModule } from '../combos/combos.module';
import { FlashSalesModule } from '../flash-sales/flash-sales.module';
import { BannersModule } from '../banners/banners.module';
import { BlogsModule } from '../blogs/blogs.module';
import { PopupsModule } from '../popups/popups.module';
import { CustomerAuthModule } from '../customer-auth/customer-auth.module';
import { StorefrontController } from './storefront.controller';

@Module({
  imports: [
    CategoriesModule,
    ProductsModule,
    CombosModule,
    FlashSalesModule,
    BannersModule,
    BlogsModule,
    PopupsModule,
    CustomerAuthModule,
  ],
  controllers: [StorefrontController],
})
export class StorefrontModule {}
