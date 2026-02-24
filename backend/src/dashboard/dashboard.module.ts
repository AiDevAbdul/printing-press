import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { Order } from '../orders/entities/order.entity';
import { ProductionJob } from '../production/entities/production-job.entity';
import { InventoryItem } from '../inventory/entities/inventory-item.entity';
import { Invoice } from '../costing/entities/invoice.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Order, ProductionJob, InventoryItem, Invoice])],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
