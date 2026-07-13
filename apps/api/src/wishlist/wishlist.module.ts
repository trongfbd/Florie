import { Module } from '@nestjs/common';
import { CustomerAuthModule } from '../customer-auth/customer-auth.module';
import { WishlistController } from './wishlist.controller';
import { WishlistService } from './wishlist.service';

@Module({
  imports: [CustomerAuthModule],
  controllers: [WishlistController],
  providers: [WishlistService],
})
export class WishlistModule {}
