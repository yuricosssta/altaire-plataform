import { Injectable, NotFoundException, Optional } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EditorialVersionRepository } from '../repositories/editorial-version.repository';
import { EditorialMapaRepository } from '../repositories/editorial-mapa.repository';
import { EditorialProjectRepository } from '../repositories/editorial-project.repository';
import { MapaGenerator } from '../generators/mapa-generator';
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
import {
  CreateVersion,
  ExtractIcpInput,
} from '../validations/editorial-version.zod';

@Injectable()
export class EditorialVersionService {
  constructor(
    private readonly versionRepository: EditorialVersionRepository,
    private readonly mapaRepository: EditorialMapaRepository,
    private readonly projectRepository: EditorialProjectRepository,
    private readonly eventEmitter: EventEmitter2,
    @Optional() private readonly mapaGenerator?: MapaGenerator,
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

  async extractIcp(projectId: string, data: ExtractIcpInput) {
    const project = await this.projectRepository.findById(projectId);
    if (!project) throw new NotFoundException('Projeto não encontrado.');

    if (!this.mapaGenerator) {
      return {
        profileSummary: `Perfil extraído para ${project.niche} (${project.subniche}).`,
        vocabularyAndSlang: 'Vocabulário técnico-acessível do nicho.',
        pains: ['Dificuldade em converter audiência em clientes recorrentes'],
        desires: ['Construir posicionamento sólido e previsível'],
        objections: ['Falta de tempo para produzir conteúdo estratégico'],
        myths: ['Precisa postar todos os dias sem estratégia'],
        triggers: ['Prova social prática', 'Método passo a passo'],
        awarenessStrategies: [],
      };
    }

    return this.mapaGenerator.extractStructuredIcp({
      projectId,
      niche: data.niche || project.niche,
      subniche: project.subniche,
      rawText: data.rawText,
    });
  }

  async createVersion(
    projectId: string,
    userId: string,
    input: CreateVersion,
  ): Promise<IEditorialVersion & { mapa?: IEditorialMapa }> {
    const project = await this.projectRepository.findById(projectId);
    if (!project) throw new NotFoundException('Projeto não encontrado.');

    const maxVersion =
      await this.versionRepository.findMaxVersionNumber(projectId);
    const versionNumber = maxVersion + 1;

    let strategicBase = input.strategicBase;
    let sourceMapa: IEditorialMapa | null = null;
    if (input.duplicateFromVersionId) {
      const sourceVersion = await this.versionRepository.findById(
        input.duplicateFromVersionId,
      );
      if (sourceVersion) {
        strategicBase = strategicBase ?? sourceVersion.strategicBase;
        sourceMapa = await this.mapaRepository.findByVersionId(
          input.duplicateFromVersionId,
        );
      }
    }

    const status = input.status || 'draft';

    const version = await this.versionRepository.create({
      projectId,
      versionNumber,
      name: input.name,
      status,
      phaseTag: input.phaseTag,
      reviewReason: input.reviewReason,
      strategicBase,
      createdBy: userId,
    });

    const versionId = String(version._id || (version as any).id);

    if (status === 'active') {
      await this.versionRepository.archiveOthers(projectId, versionId);
      await this.projectRepository.update(projectId, {
        editorialLineStatus: 'active',
        currentPhaseLabel: 'Linha Editorial ativa',
      });
    }

    let mapa: IEditorialMapa | undefined;
    if (this.mapaGenerator && strategicBase) {
      const generated = await this.mapaGenerator.generateStrategicMapa({
        projectId,
        niche: project.niche,
        subniche: project.subniche,
        objective: project.currentObjective,
        strategicBase,
      });
      mapa = await this.mapaRepository.create({
        versionId,
        versionNumber,
        name: input.name,
        positioningPhrase: generated.positioningPhrase,
        mensagemCentral: generated.mensagemCentral,
        pilares: generated.pilares,
        tomDeVoz: generated.tomDeVoz,
        retina: generated.retina,
      });
      if (!strategicBase.pillars && generated.strategicBase) {
        await this.versionRepository.update(versionId, {
          strategicBase: generated.strategicBase,
        });
      }
    } else if (sourceMapa) {
      mapa = await this.mapaRepository.create({
        versionId,
        versionNumber,
        name: input.name,
        positioningPhrase: sourceMapa.positioningPhrase,
        mensagemCentral: sourceMapa.mensagemCentral,
        pilares: sourceMapa.pilares || [],
        tomDeVoz: sourceMapa.tomDeVoz || { traits: [], rules: [] },
        retina: sourceMapa.retina || [],
      });
    } else {
      mapa = await this.mapaRepository.create({
        versionId,
        versionNumber,
        name: input.name,
        mensagemCentral: '',
        pilares: [],
        tomDeVoz: { traits: [], rules: [] },
        retina: [],
      });
    }

    this.emitEvent(EDITORIAL_EVENTS.VERSION_CREATED, version);

    return {
      ...version,
      id: versionId,
      mapa,
    };
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

    const projectId = version.projectId.toString();

    if (data.status === 'active') {
      await this.versionRepository.archiveOthers(projectId, id);
      await this.projectRepository.update(projectId, {
        editorialLineStatus: 'active',
        currentPhaseLabel: 'Linha Editorial ativa',
      });
    }

    if (data.strategicBase && this.mapaGenerator) {
      const project = await this.projectRepository.findById(projectId);
      const existingMapa = await this.mapaRepository.findByVersionId(id);
      const generated = await this.mapaGenerator.generateStrategicMapa({
        projectId,
        niche: project?.niche || 'Negócios Digitais',
        subniche: project?.subniche || 'Estratégia de Conteúdo',
        objective: project?.currentObjective || 'Posicionamento e vendas',
        strategicBase: data.strategicBase,
      });

      if (existingMapa) {
        await this.mapaRepository.update(id, {
          name: data.name || existingMapa.name,
          positioningPhrase: generated.positioningPhrase,
          mensagemCentral: generated.mensagemCentral,
          pilares: generated.pilares,
          tomDeVoz: generated.tomDeVoz,
          retina: generated.retina,
        });
      }
    }

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

    const initialStrategicBase: Record<string, unknown> = {
      niche: data.nicheData.niche,
      subniche: data.nicheData.subniche,
      pains: data.audienceData?.pains || [],
      desires: data.audienceData?.desires || [],
      objections: data.audienceData?.objections || [],
      offerPromise: data.offerData?.promise,
      bigIdea: data.brandingData?.bigIdea,
      positioningPhrase: data.brandingData?.positioningPhrase,
    };

    const version = await this.versionRepository.create({
      projectId,
      versionNumber,
      name: 'Versão Inicial',
      status: 'active',
      strategicBase: this.mapaGenerator ? initialStrategicBase : undefined,
      createdBy: userId,
    });

    const mensagemCentral = data.brandingData.bigIdea || data.offerData.promise;
    const traits: string[] = [data.brandingData.communicationStyle];
    if (data.brandingData.brandPersonality) {
      traits.push(data.brandingData.brandPersonality);
    }

    const generatedMapa = this.mapaGenerator
      ? await this.mapaGenerator.generateStrategicMapa({
          projectId,
          niche: data.nicheData.niche,
          subniche: data.nicheData.subniche,
          objective: data.offerData.promise || 'Autoridade e conversão',
          strategicBase: initialStrategicBase,
        })
      : null;

    const mapa = await this.mapaRepository.create({
      versionId: version._id || (version as any).id,
      versionNumber,
      name: 'Versão Inicial',
      positioningPhrase:
        data.brandingData.positioningPhrase ||
        generatedMapa?.positioningPhrase ||
        undefined,
      mensagemCentral: mensagemCentral || generatedMapa?.mensagemCentral || '',
      pilares: generatedMapa?.pilares || [],
      tomDeVoz: { traits, rules: generatedMapa?.tomDeVoz?.rules || [] },
      retina: generatedMapa?.retina || [],
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

    const projectId = original.projectId.toString();

    const maxVersion =
      await this.versionRepository.findMaxVersionNumber(projectId);
    const versionNumber = maxVersion + 1;

    const version = await this.versionRepository.create({
      projectId,
      versionNumber,
      name: `Cópia de ${original.name}`,
      status: 'draft',
      phaseTag: original.phaseTag,
      strategicBase: original.strategicBase,
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
