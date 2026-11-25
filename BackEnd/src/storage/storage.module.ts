import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StorageService } from './services/storage.service';
import { StorageController } from './controllers/storage.controller';
import { FileAsset, FileAssetSchema } from './schemas/file-asset.schema';
import { FileAssetRepository } from './repositories/file-asset.repository';
import { FileAssetMongooseRepository } from './repositories/mongoose/file-asset.mongoose.repository';
import { CompanyModule } from '../company/company.module';
import { BrandModule } from '../brand/brand.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: FileAsset.name, schema: FileAssetSchema },
    ]),
    CompanyModule,
    BrandModule,
  ],
  providers: [
    StorageService,
    {
      provide: FileAssetRepository,
      useClass: FileAssetMongooseRepository,
    },
  ],
  controllers: [StorageController],
  exports: [StorageService],
})
export class StorageModule {}
