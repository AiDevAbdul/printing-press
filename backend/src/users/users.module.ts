import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { Company } from '../companies/entities/company.entity';
import { PermissionsService } from './permissions.service';
import { SubstituteService } from './substitute.service';
import { NotificationsModule } from '../notifications/notifications.module';
import { ActivityLogModule } from '../activity-log/activity-log.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Company]),
    NotificationsModule,
    ActivityLogModule,
  ],
  controllers: [UsersController],
  providers: [UsersService, PermissionsService, SubstituteService],
  exports: [UsersService, PermissionsService, SubstituteService],
})
export class UsersModule {}

