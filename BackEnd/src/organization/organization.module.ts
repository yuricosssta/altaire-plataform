//src/organization/organization.module.ts
import { Module } from '@nestjs/common';
import { OrganizationController } from './controllers/organization.controller';
import { OrganizationService } from './services/organization.service';
import { MongooseModule } from '@nestjs/mongoose';
import { OrganizationSchema } from './schemas/organization.schema';
import { OrganizationMemberSchema } from './schemas/organization-member.schema';
import { OrganizationFunctionSchema } from './schemas/organization-function.schema';
import { OrganizationFunctionRepository } from './repositories/organization-function.repository';
import { OrganizationFunctionMongooseRepository } from './repositories/mongoose/organization-function.mongoose.repository';
import { UsersModule } from '../users/user.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Organization', schema: OrganizationSchema },
      { name: 'OrganizationMember', schema: OrganizationMemberSchema },
      { name: 'OrganizationFunction', schema: OrganizationFunctionSchema },
    ]),
    UsersModule,
  ],
  controllers: [OrganizationController],
  providers: [
    OrganizationService,
    {
      provide: OrganizationFunctionRepository,
      useClass: OrganizationFunctionMongooseRepository,
    },
  ],
  exports: [
    OrganizationService,
    OrganizationFunctionRepository,
    MongooseModule,
  ],
})
export class OrganizationModule {}
