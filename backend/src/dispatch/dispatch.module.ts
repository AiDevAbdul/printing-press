import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DispatchService } from './dispatch.service';
import { DispatchController } from './dispatch.controller';
import { Delivery } from './entities/delivery.entity';
import { PackingList } from './entities/packing-list.entity';
import { Challan } from './entities/challan.entity';
import { DeliveryTracking } from './entities/delivery-tracking.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Delivery,
      PackingList,
      Challan,
      DeliveryTracking,
    ]),
  ],
  controllers: [DispatchController],
  providers: [DispatchService],
  exports: [DispatchService],
})
export class DispatchModule {}
