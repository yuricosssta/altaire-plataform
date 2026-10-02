import { Injectable, NotFoundException } from '@nestjs/common';
import { EditorialProjectRepository } from '../repositories/editorial-project.repository';
import {
  ICreateEditorialProject,
  IUpdateEditorialProject,
} from '../schemas/models/editorial-project.interface';

@Injectable()
export class EditorialProjectService {
  constructor(private readonly projectRepository: EditorialProjectRepository) {}

  async findAll(orgId: string) {
    return this.projectRepository.findAll(orgId);
  }

  async findById(id: string) {
    const project = await this.projectRepository.findById(id);
    if (!project)
      throw new NotFoundException('Projeto editorial não encontrado.');
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
