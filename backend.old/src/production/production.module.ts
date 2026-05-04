import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductionService } from './production.service';
import { ProductionController } from './production.controller';
import { WorkflowApprovalService } from './workflow-approval.service';
import { WorkflowApprovalController } from './workflow-approval.controller';
import { ProductionJob } from './entities/production-job.entity';
import { ProductionStageHistory } from './entities/production-stage-history.entity';
import { ProductionWorkflowStage } from './entities/production-workflow-stage.entity';
import { MaterialConsumption } from './entities/material-consumption.entity';
import { MachineCounter } from './entities/machine-counter.entity';
import { WastageRecord } from './entities/wastage-record.entity';
import { OfflineSyncQueue } from './entities/offline-sync-queue.entity';
import { ApprovalsModule } from '../approvals/approvals.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { ActivityLogModule } from '../activity-log/activity-log.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProductionJob,
      ProductionStageHistory,
      ProductionWorkflowStage,
      MaterialConsumption,
      MachineCounter,
      WastageRecord,
      OfflineSyncQueue,
    ]),
    ApprovalsModule,
    NotificationsModule,
    ActivityLogModule,
    UsersModule,
  ],
  controllers: [ProductionController, WorkflowApprovalController],
  providers: [ProductionService, WorkflowApprovalService],
  exports: [ProductionService, WorkflowApprovalService],
})
export class ProductionModule {}


