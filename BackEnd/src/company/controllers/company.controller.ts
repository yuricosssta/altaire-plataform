import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../../auth/auth.guard';
import { ZodValidationPipe } from '../../shared/pipe/zod-validation.pipe';
import { CompanyService } from '../services/company.service';
import {
  CreateCompanyInput,
  createCompanySchema,
  UpdateCompanyInput,
  updateCompanyPlanSchema,
  UpdateCompanyPlanInput,
  updateCompanySchema,
  UpdateCompanySettingsInput,
  updateCompanySettingsSchema,
} from '../validations/company.zod';
import {
  AddCompanyMemberInput,
  addCompanyMemberSchema,
  UpdateCompanyMemberInput,
  updateCompanyMemberSchema,
} from '../validations/company-member.zod';
import {
  CreateCompanyFunctionInput,
  createCompanyFunctionSchema,
  UpdateCompanyFunctionInput,
  updateCompanyFunctionSchema,
} from '../validations/company-function.zod';

@Controller('companies')
@UseGuards(AuthGuard)
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Get('my')
  findAllForUser(@Req() req: any) {
    return this.companyService.findAllForUser(req.user);
  }

  @Post()
  create(
    @Body(new ZodValidationPipe(createCompanySchema)) body: CreateCompanyInput,
    @Req() req: any,
  ) {
    return this.companyService.create(body, req.user);
  }

  @Get(':companyId')
  findById(@Param('companyId') companyId: string, @Req() req: any) {
    return this.companyService.findById(companyId, req.user);
  }

  @Patch(':companyId')
  update(
    @Param('companyId') companyId: string,
    @Body(new ZodValidationPipe(updateCompanySchema)) body: UpdateCompanyInput,
    @Req() req: any,
  ) {
    return this.companyService.update(companyId, body, req.user);
  }

  @Patch(':companyId/settings')
  updateSettings(
    @Param('companyId') companyId: string,
    @Body(new ZodValidationPipe(updateCompanySettingsSchema))
    body: UpdateCompanySettingsInput,
    @Req() req: any,
  ) {
    return this.companyService.updateSettings(companyId, body, req.user);
  }

  @Patch(':companyId/plan')
  updatePlan(
    @Param('companyId') companyId: string,
    @Body(new ZodValidationPipe(updateCompanyPlanSchema))
    body: UpdateCompanyPlanInput,
    @Req() req: any,
  ) {
    return this.companyService.updatePlan(companyId, body.plan, req.user);
  }

  @Delete(':companyId')
  softDelete(@Param('companyId') companyId: string, @Req() req: any) {
    return this.companyService.softDelete(companyId, req.user);
  }

  // --- MEMBROS ---

  @Get(':companyId/members')
  listMembers(@Param('companyId') companyId: string, @Req() req: any) {
    return this.companyService.listMembers(companyId, req.user);
  }

  @Post(':companyId/members')
  addMember(
    @Param('companyId') companyId: string,
    @Body(new ZodValidationPipe(addCompanyMemberSchema))
    body: AddCompanyMemberInput,
    @Req() req: any,
  ) {
    return this.companyService.addMember(companyId, body, req.user);
  }

  @Patch(':companyId/members/:userId')
  updateMember(
    @Param('companyId') companyId: string,
    @Param('userId') userId: string,
    @Body(new ZodValidationPipe(updateCompanyMemberSchema))
    body: UpdateCompanyMemberInput,
    @Req() req: any,
  ) {
    return this.companyService.updateMember(companyId, userId, body, req.user);
  }

  @Delete(':companyId/members/:userId')
  removeMember(
    @Param('companyId') companyId: string,
    @Param('userId') userId: string,
    @Req() req: any,
  ) {
    return this.companyService.removeMember(companyId, userId, req.user);
  }

  // --- FUNÇÕES / CARGOS CUSTOMIZADOS ---

  @Get(':companyId/functions')
  listFunctions(@Param('companyId') companyId: string, @Req() req: any) {
    return this.companyService.listFunctions(companyId, req.user);
  }

  @Post(':companyId/functions')
  createFunction(
    @Param('companyId') companyId: string,
    @Body(new ZodValidationPipe(createCompanyFunctionSchema))
    body: CreateCompanyFunctionInput,
    @Req() req: any,
  ) {
    return this.companyService.createFunction(companyId, body, req.user);
  }

  @Patch(':companyId/functions/:functionId')
  updateFunction(
    @Param('companyId') companyId: string,
    @Param('functionId') functionId: string,
    @Body(new ZodValidationPipe(updateCompanyFunctionSchema))
    body: UpdateCompanyFunctionInput,
    @Req() req: any,
  ) {
    return this.companyService.updateFunction(
      companyId,
      functionId,
      body,
      req.user,
    );
  }

  @Delete(':companyId/functions/:functionId')
  deleteFunction(
    @Param('companyId') companyId: string,
    @Param('functionId') functionId: string,
    @Req() req: any,
  ) {
    return this.companyService.deleteFunction(companyId, functionId, req.user);
  }
}
