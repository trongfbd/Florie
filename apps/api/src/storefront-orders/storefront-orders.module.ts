import { Module } from '@nestjs/common';
import { OrdersModule } from '../orders/orders.module';
import { CustomerAuthModule } from '../customer-auth/customer-auth.module';
import { StorefrontOrdersController } from './storefront-orders.controller';
import { StorefrontOrdersService } from './storefront-orders.service';

@Module({
  imports: [OrdersModule, CustomerAuthModule],
  controllers: [StorefrontOrdersController],
  providers: [StorefrontOrdersService],
})
export class StorefrontOrdersModule {}
