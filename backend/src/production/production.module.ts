import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductionService } from './production.service';
import { ProductionController } from './production.controller';
import { ProductionJob } from './entities/production-job.entity';
import { ProductionStageHistory } from './entities/production-stage-history.entity';
import { MaterialConsumption } from './entities/material-consumption.entity';
import { MachineCounter } from './entities/machine-counter.entity';
import { WastageRecord } from './entities/wastage-record.entity';
import { OfflineSyncQueue } from './entities/offline-sync-queue.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProductionJob,
      ProductionStageHistory,
      MaterialConsumption,
      MachineCounter,
      WastageRecord,
      OfflineSyncQueue,
    ]),
  ],
  controllers: [ProductionController],
  providers: [ProductionService],
  exports: [ProductionService],
})
export class ProductionModule {}
