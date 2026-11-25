import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Company, CompanySchema } from './schemas/company.schema';
import {
  CompanyMember,
  CompanyMemberSchema,
} from './schemas/company-member.schema';
import {
  CompanyFunction,
  CompanyFunctionSchema,
} from './schemas/company-function.schema';
import { CompanyRepository } from './repositories/company.repository';
import { CompanyMongooseRepository } from './repositories/mongoose/company.mongoose.repository';
import { CompanyMemberRepository } from './repositories/company-member.repository';
import { CompanyMemberMongooseRepository } from './repositories/mongoose/company-member.mongoose.repository';
import { CompanyFunctionRepository } from './repositories/company-function.repository';
import { CompanyFunctionMongooseRepository } from './repositories/mongoose/company-function.mongoose.repository';
import { CompanyAccessService } from './services/company-access.service';
import { CompanyService } from './services/company.service';
import { CompanyAccessGuard } from './guards/company-access.guard';
import { CompanyController } from './controllers/company.controller';
import { OrganizationModule } from '../organization/organization.module';
import { UsersModule } from '../users/user.module';
import { BrandModule } from '../brand/brand.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Company.name, schema: CompanySchema },
      { name: CompanyMember.name, schema: CompanyMemberSchema },
      { name: CompanyFunction.name, schema: CompanyFunctionSchema },
    ]),
    OrganizationModule,
    UsersModule,
    forwardRef(() => BrandModule),
  ],
  controllers: [CompanyController],
  providers: [
    CompanyAccessService,
    CompanyService,
    CompanyAccessGuard,
    {
      provide: CompanyRepository,
      useClass: CompanyMongooseRepository,
    },
    {
      provide: CompanyMemberRepository,
      useClass: CompanyMemberMongooseRepository,
    },
    {
      provide: CompanyFunctionRepository,
      useClass: CompanyFunctionMongooseRepository,
    },
  ],
  exports: [
    CompanyAccessService,
    CompanyService,
    CompanyAccessGuard,
    CompanyRepository,
    CompanyMemberRepository,
    CompanyFunctionRepository,
  ],
})
export class CompanyModule {}
