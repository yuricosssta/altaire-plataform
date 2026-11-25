import {
  ContentFormat,
  RetinaType,
} from '../schemas/models/editorial-calendar.interface';
import {
  IScriptBlock,
  IScriptBriefing,
  IScriptContent,
  ScriptMode,
} from '../schemas/models/editorial-script.interface';

export interface IScriptGenerationContext {
  scriptId: string;
  projectId: string;
  format: ContentFormat;
  mode: ScriptMode;
  themeTitle?: string;
  retinaType?: RetinaType;
  niche?: string;
  subniche?: string;
  editorialPillar?: string;
  strategicObjective?: string;
  icpPainOrObjection?: string;
  businessMoment?: string;
  platform?: string;
  briefing?: IScriptBriefing;
}

export abstract class ScriptGenerator {
  abstract generate(context: IScriptGenerationContext): Promise<IScriptContent>;

  abstract regenerateBlock(
    block: IScriptBlock,
    context?: string,
  ): Promise<IScriptBlock>;

  abstract regenerateStoryCard(context: {
    period: 'Manhã' | 'Almoço' | 'Tarde' | 'Noite';
    cardNumber: number;
    currentCard: Record<string, unknown>;
    icpPainOrObjection?: string;
    subniche?: string;
  }): Promise<Record<string, unknown>>;

  abstract adaptScriptToProject(context: {
    sourceScript: Record<string, unknown>;
    targetProject: {
      id: string;
      name: string;
      niche: string;
      subniche: string;
      currentObjective: string;
    };
    targetStrategicBase?: Record<string, unknown>;
    customTitle?: string;
    preserveComplementaryMaterial?: boolean;
  }): Promise<Record<string, unknown>>;
}
