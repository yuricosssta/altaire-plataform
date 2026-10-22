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
  briefing?: IScriptBriefing;
}

export abstract class ScriptGenerator {
  abstract generate(context: IScriptGenerationContext): Promise<IScriptContent>;

  abstract regenerateBlock(
    block: IScriptBlock,
    context?: string,
  ): Promise<IScriptBlock>;
}
