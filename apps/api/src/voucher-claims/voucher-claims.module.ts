import { Module } from '@nestjs/common';
import { CustomerAuthModule } from '../customer-auth/customer-auth.module';
import { VoucherClaimsController } from './voucher-claims.controller';
import { VoucherClaimsService } from './voucher-claims.service';

@Module({
  imports: [CustomerAuthModule],
  controllers: [VoucherClaimsController],
  providers: [VoucherClaimsService],
  exports: [VoucherClaimsService],
})
export class VoucherClaimsModule {}
