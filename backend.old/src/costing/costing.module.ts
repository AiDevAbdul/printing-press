import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CostingService } from './costing.service';
import { CostingController, InvoicesController } from './costing.controller';
import { JobCost } from './entities/job-cost.entity';
import { Invoice } from './entities/invoice.entity';
import { InvoiceItem } from './entities/invoice-item.entity';
import { CostingConfig } from './entities/costing-config.entity';
import { ProductionJob } from '../production/entities/production-job.entity';
import { Order } from '../orders/entities/order.entity';

@Module({
  imports: [TypeOrmModule.forFeature([JobCost, Invoice, InvoiceItem, CostingConfig, ProductionJob, Order])],
  controllers: [CostingController, InvoicesController],
  providers: [CostingService],
  exports: [CostingService],
})
export class CostingModule {}
