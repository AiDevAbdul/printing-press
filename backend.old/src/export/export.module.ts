import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExportService } from './export.service';
import { ExportController } from './export.controller';
import { WastageRecord } from '../production/entities/wastage-record.entity';
import { QualityInspection } from '../quality/entities/quality-inspection.entity';
import { Order } from '../orders/entities/order.entity';
import { ProductionJob } from '../production/entities/production-job.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      WastageRecord,
      QualityInspection,
      Order,
      ProductionJob,
    ]),
  ],
  controllers: [ExportController],
  providers: [ExportService],
  exports: [ExportService],
})
export class ExportModule {}
