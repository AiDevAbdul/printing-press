import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivityLogService } from './activity-log.service';
import { UserActivityLog } from './entities/user-activity-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserActivityLog])],
  providers: [ActivityLogService],
  exports: [ActivityLogService],
})
export class ActivityLogModule {}
