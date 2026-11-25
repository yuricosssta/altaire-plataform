import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { CompanyAccessService } from '../services/company-access.service';

@Injectable()
export class CompanyAccessGuard implements CanActivate {
  constructor(private readonly companyAccessService: CompanyAccessService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    if (!request.user) {
      throw new ForbiddenException('Usuário não autenticado.');
    }

    const companyId =
      request.params?.companyId || request.headers?.['x-company-id'];

    if (!companyId) {
      throw new BadRequestException(
        'O identificador da empresa (x-company-id) é obrigatório.',
      );
    }

    const companyContext =
      await this.companyAccessService.resolveCompanyContext(
        request.user,
        String(companyId),
      );

    request.companyContext = companyContext;
    return true;
  }
}
