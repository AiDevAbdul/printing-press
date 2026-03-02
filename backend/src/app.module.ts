import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { dataSourceOptions } from './config/database.config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CustomersModule } from './customers/customers.module';
import { OrdersModule } from './orders/orders.module';
import { ProductionModule } from './production/production.module';
import { InventoryModule } from './inventory/inventory.module';
import { CostingModule } from './costing/costing.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { QuotationsModule } from './quotations/quotations.module';
import { QualityModule } from './quality/quality.module';
import { DispatchModule } from './dispatch/dispatch.module';
import { ExportModule } from './export/export.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot(dataSourceOptions),
    AuthModule,
    UsersModule,
    CustomersModule,
    OrdersModule,
    QuotationsModule,
    ProductionModule,
    InventoryModule,
    CostingModule,
    DashboardModule,
    QualityModule,
    DispatchModule,
    ExportModule,
  ],
})
export class AppModule {}
