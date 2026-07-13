import { Module } from '@nestjs/common';
import { MaterialsModule } from '../materials/materials.module';
import { ProductsModule } from '../products/products.module';
import { ReportsModule } from '../reports/reports.module';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { GeminiService } from './gemini.service';

@Module({
  imports: [ProductsModule, ReportsModule, MaterialsModule],
  controllers: [AiController],
  providers: [AiService, GeminiService],
})
export class AiModule {}
