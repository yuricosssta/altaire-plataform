import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EditorialProjectRepository } from '../repositories/editorial-project.repository';
import {
  ICreateEditorialProject,
  IUpdateEditorialProject,
} from '../schemas/models/editorial-project.interface';

@Injectable()
export class EditorialProjectService {
  constructor(private readonly projectRepository: EditorialProjectRepository) {}

  async findAll(
    orgId: string,
    createdBy?: string,
    allowedProjectIds?: string[],
  ) {
    if (Array.isArray(allowedProjectIds)) {
      if (allowedProjectIds.length === 0) {
        return [];
      }
      return this.projectRepository.findAll(
        orgId,
        undefined,
        allowedProjectIds,
      );
    }
    if (createdBy) {
      return this.projectRepository.findAll(orgId, createdBy);
    }
    return this.projectRepository.findAll(orgId);
  }

  async findById(
    id: string,
    userId?: string,
    allowedProjectIds?: string[],
  ) {
    const project = await this.projectRepository.findById(id);
    if (!project)
      throw new NotFoundException('Projeto editorial não encontrado.');

    if (Array.isArray(allowedProjectIds)) {
      const projectIdStr = String(
        (project as any)._id || (project as any).id || id,
      );
      if (!allowedProjectIds.map(String).includes(projectIdStr)) {
        throw new ForbiddenException(
          'Acesso negado: você não possui permissão para visualizar este projeto.',
        );
      }
      return project;
    }

    if (
      userId &&
      project.createdBy &&
      String(project.createdBy) !== String(userId)
    ) {
      throw new ForbiddenException(
        'Acesso negado: este projeto pertence a outro usuário.',
      );
    }
    return project;
  }

  async create(data: ICreateEditorialProject) {
    return this.projectRepository.create(data);
  }

  async update(id: string, data: IUpdateEditorialProject) {
    const project = await this.projectRepository.update(id, data);
    if (!project)
      throw new NotFoundException('Projeto editorial não encontrado.');
    return project;
  }

  async delete(id: string) {
    const project = await this.projectRepository.softDelete(id);
    if (!project)
      throw new NotFoundException('Projeto editorial não encontrado.');
    return { message: 'Projeto editorial removido com sucesso.' };
  }
}
