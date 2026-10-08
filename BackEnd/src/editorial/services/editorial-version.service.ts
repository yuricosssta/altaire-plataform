import { Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EditorialVersionRepository } from '../repositories/editorial-version.repository';
import { EditorialMapaRepository } from '../repositories/editorial-mapa.repository';
import { EditorialProjectRepository } from '../repositories/editorial-project.repository';
import {
  IEditorialVersion,
  IUpdateEditorialVersion,
} from '../schemas/models/editorial-version.interface';
import {
  IEditorialMapa,
  IUpdateEditorialMapa,
} from '../schemas/models/editorial-mapa.interface';
import { EDITORIAL_EVENTS } from '../../shared/events/editorial.events';
import { OnboardingInput } from '../validations/onboarding.zod';

@Injectable()
export class EditorialVersionService {
  constructor(
    private readonly versionRepository: EditorialVersionRepository,
    private readonly mapaRepository: EditorialMapaRepository,
    private readonly projectRepository: EditorialProjectRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async findByProjectId(projectId: string): Promise<IEditorialVersion[]> {
    return this.versionRepository.findAllByProject(projectId);
  }

  async findById(id: string): Promise<IEditorialVersion> {
    const version = await this.versionRepository.findById(id);
    if (!version) throw new NotFoundException('Versão não encontrada.');
    return version;
  }

  async findMapa(versionId: string): Promise<IEditorialMapa> {
    const mapa = await this.mapaRepository.findByVersionId(versionId);
    if (!mapa)
      throw new NotFoundException('Mapa não encontrado para esta versão.');
    return mapa;
  }

  async updateMapa(
    versionId: string,
    data: IUpdateEditorialMapa,
  ): Promise<IEditorialMapa> {
    const version = await this.versionRepository.findById(versionId);
    if (!version) throw new NotFoundException('Versão não encontrada.');

    const mapa = await this.mapaRepository.update(versionId, data);
    if (!mapa)
      throw new NotFoundException('Mapa não encontrado para esta versão.');
    return mapa;
  }

  async update(
    id: string,
    data: IUpdateEditorialVersion,
  ): Promise<IEditorialVersion> {
    const version = await this.versionRepository.update(id, data);
    if (!version) throw new NotFoundException('Versão não encontrada.');

    if (data.status === 'archived') {
      this.emitEvent(EDITORIAL_EVENTS.VERSION_ARCHIVED, version);
    }

    return version;
  }

  async delete(id: string): Promise<{ message: string }> {
    const version = await this.versionRepository.softDelete(id);
    if (!version) throw new NotFoundException('Versão não encontrada.');

    if (version) {
      await this.mapaRepository.deleteByVersionId(id);
    }

    return { message: 'Versão removida com sucesso.' };
  }

  async createFromOnboarding(
    projectId: string,
    data: OnboardingInput,
    userId: string,
  ): Promise<{ version: IEditorialVersion; mapa: IEditorialMapa }> {
    const projectUpdate: Record<string, unknown> = {
      niche: data.nicheData.niche,
      subniche: data.nicheData.subniche,
      editorialLineStatus: 'active',
    };

    await this.projectRepository.update(projectId, projectUpdate as any);

    const maxVersion =
      await this.versionRepository.findMaxVersionNumber(projectId);
    const versionNumber = maxVersion + 1;

    const version = await this.versionRepository.create({
      projectId,
      versionNumber,
      name: 'Versão Inicial',
      createdBy: userId,
    });

    const mensagemCentral = data.brandingData.bigIdea || data.offerData.promise;
    const traits: string[] = [data.brandingData.communicationStyle];
    if (data.brandingData.brandPersonality) {
      traits.push(data.brandingData.brandPersonality);
    }

    const mapa = await this.mapaRepository.create({
      versionId: version._id || (version as any).id,
      versionNumber,
      name: 'Versão Inicial',
      positioningPhrase: data.brandingData.positioningPhrase || undefined,
      mensagemCentral,
      pilares: [],
      tomDeVoz: { traits, rules: [] },
      retina: [],
    });

    this.emitEvent(EDITORIAL_EVENTS.ONBOARDING_COMPLETED, version);
    this.emitEvent(EDITORIAL_EVENTS.VERSION_CREATED, version);

    return { version, mapa };
  }

  async duplicate(
    versionId: string,
    userId: string,
  ): Promise<IEditorialVersion> {
    const original = await this.versionRepository.findById(versionId);
    if (!original)
      throw new NotFoundException('Versão original não encontrada.');

    const originalMapa = await this.mapaRepository.findByVersionId(versionId);

    const projectId = (original as any).pid
      ? (original as any).pid.toString()
      : original.projectId;

    const maxVersion =
      await this.versionRepository.findMaxVersionNumber(projectId);
    const versionNumber = maxVersion + 1;

    const version = await this.versionRepository.create({
      projectId,
      versionNumber,
      name: `Cópia de ${original.name}`,
      createdBy: userId,
    });

    if (originalMapa) {
      await this.mapaRepository.create({
        versionId: version._id || (version as any).id,
        versionNumber,
        name: `Cópia de ${originalMapa.name}`,
        positioningPhrase: originalMapa.positioningPhrase,
        mensagemCentral: originalMapa.mensagemCentral,
        pilares: originalMapa.pilares,
        tomDeVoz: originalMapa.tomDeVoz,
        retina: originalMapa.retina,
      });
    }

    this.emitEvent(EDITORIAL_EVENTS.VERSION_DUPLICATED, version);

    return version;
  }

  private emitEvent(
    event: (typeof EDITORIAL_EVENTS)[keyof typeof EDITORIAL_EVENTS],
    version: IEditorialVersion,
  ): void {
    this.eventEmitter.emit(event, {
      event,
      projectId: version.projectId,
      versionId: version._id || (version as any).id,
      versionNumber: version.versionNumber,
      triggeredBy: version.createdBy,
      timestamp: new Date(),
    });
  }
}
