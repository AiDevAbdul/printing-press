import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PrepressService } from './prepress.service';
import { PrepressController } from './prepress.controller';
import { Design } from './entities/design.entity';
import { DesignApproval } from './entities/design-approval.entity';
import { DesignAttachment } from './entities/design-attachment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Design, DesignApproval, DesignAttachment])],
  providers: [PrepressService],
  controllers: [PrepressController],
  exports: [PrepressService],
})
export class PrepressModule {}
