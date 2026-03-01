import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductionService } from './production.service';
import { ProductionController } from './production.controller';
import { ProductionJob } from './entities/production-job.entity';
import { ProductionStageHistory } from './entities/production-stage-history.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProductionJob, ProductionStageHistory])],
  controllers: [ProductionController],
  providers: [ProductionService],
  exports: [ProductionService],
})
export class ProductionModule {}
