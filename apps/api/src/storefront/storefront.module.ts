import { Module } from '@nestjs/common';
import { CategoriesModule } from '../categories/categories.module';
import { ProductsModule } from '../products/products.module';
import { StorefrontController } from './storefront.controller';

@Module({
  imports: [CategoriesModule, ProductsModule],
  controllers: [StorefrontController],
})
export class StorefrontModule {}
