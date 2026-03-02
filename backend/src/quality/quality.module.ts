import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QualityService } from './quality.service';
import { QualityController } from './quality.controller';
import { QualityCheckpoint } from './entities/quality-checkpoint.entity';
import { QualityInspection } from './entities/quality-inspection.entity';
import { QualityDefect } from './entities/quality-defect.entity';
import { QualityRejection } from './entities/quality-rejection.entity';
import { CustomerComplaint } from './entities/customer-complaint.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      QualityCheckpoint,
      QualityInspection,
      QualityDefect,
      QualityRejection,
      CustomerComplaint,
    ]),
  ],
  controllers: [QualityController],
  providers: [QualityService],
  exports: [QualityService],
})
export class QualityModule {}
