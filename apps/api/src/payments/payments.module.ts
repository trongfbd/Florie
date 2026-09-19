import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { VnpayService } from './vnpay.service';
import { MomoService } from './momo.service';
import { ZalopayService } from './zalopay.service';

@Module({
  imports: [PrismaModule],
  controllers: [PaymentsController],
  providers: [PaymentsService, VnpayService, MomoService, ZalopayService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
