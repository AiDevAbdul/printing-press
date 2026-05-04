import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PrepressService } from './prepress.service';
import { PrepressController } from './prepress.controller';
import { Design } from './entities/design.entity';
import { DesignApproval } from './entities/design-approval.entity';
import { DesignAttachment } from './entities/design-attachment.entity';
import { ProductSpecification } from './entities/product-specification.entity';
import { SpecificationApproval } from './entities/specification-approval.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Design, DesignApproval, DesignAttachment, ProductSpecification, SpecificationApproval])],
  providers: [PrepressService],
  controllers: [PrepressController],
  exports: [PrepressService],
})
export class PrepressModule {}
