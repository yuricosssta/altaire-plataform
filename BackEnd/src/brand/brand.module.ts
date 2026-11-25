import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Brand, BrandSchema } from './schemas/brand.schema';
import { BrandRepository } from './repositories/brand.repository';
import { BrandMongooseRepository } from './repositories/mongoose/brand.mongoose.repository';
import { BrandService } from './services/brand.service';
import { BrandController } from './controllers/brand.controller';
import { CompanyModule } from '../company/company.module';
import { EditorialModule } from '../editorial/editorial.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Brand.name, schema: BrandSchema }]),
    forwardRef(() => CompanyModule),
    forwardRef(() => EditorialModule),
  ],
  controllers: [BrandController],
  providers: [
    BrandService,
    {
      provide: BrandRepository,
      useClass: BrandMongooseRepository,
    },
  ],
  exports: [BrandService, BrandRepository],
})
export class BrandModule {}
