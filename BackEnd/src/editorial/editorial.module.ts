import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  EditorialProject,
  EditorialProjectSchema,
} from './schemas/editorial-project.schema';
import {
  EditorialVersion,
  EditorialVersionSchema,
} from './schemas/editorial-version.schema';
import {
  EditorialMapa,
  EditorialMapaSchema,
} from './schemas/editorial-mapa.schema';
import {
  EditorialCalendar,
  EditorialCalendarSchema,
} from './schemas/editorial-calendar.schema';
import {
  EditorialTheme,
  EditorialThemeSchema,
} from './schemas/editorial-theme.schema';
import {
  EditorialCalendarThemeVersion,
  EditorialCalendarThemeVersionSchema,
} from './schemas/editorial-calendar-theme-version.schema';
import {
  EditorialScript,
  EditorialScriptSchema,
} from './schemas/editorial-script.schema';
import {
  EditorialScriptVersion,
  EditorialScriptVersionSchema,
} from './schemas/editorial-script-version.schema';
import {
  EditorialBrandStory,
  EditorialBrandStorySchema,
} from './schemas/editorial-brand-story.schema';
import {
  EditorialTask,
  EditorialTaskSchema,
} from './schemas/editorial-task.schema';
import {
  EditorialActivityLog,
  EditorialActivityLogSchema,
} from './schemas/editorial-activity.schema';

import { EditorialProjectService } from './services/editorial-project.service';
import { EditorialVersionService } from './services/editorial-version.service';
import { EditorialCalendarService } from './services/editorial-calendar.service';
import { EditorialThemeService } from './services/editorial-theme.service';
import { EditorialScriptService } from './services/editorial-script.service';
import { EditorialBrandStoryService } from './services/editorial-brand-story.service';
import { EditorialWorkspaceService } from './services/editorial-workspace.service';
import { EditorialEventListener } from './services/editorial-event.listener';

import { EditorialProjectMongooseRepository } from './repositories/mongoose/editorial-project.mongoose.repository';
import { EditorialProjectRepository } from './repositories/editorial-project.repository';
import { EditorialVersionMongooseRepository } from './repositories/mongoose/editorial-version.mongoose.repository';
import { EditorialVersionRepository } from './repositories/editorial-version.repository';
import { EditorialMapaMongooseRepository } from './repositories/mongoose/editorial-mapa.mongoose.repository';
import { EditorialMapaRepository } from './repositories/editorial-mapa.repository';
import { EditorialCalendarMongooseRepository } from './repositories/mongoose/editorial-calendar.mongoose.repository';
import { EditorialCalendarRepository } from './repositories/editorial-calendar.repository';
import { EditorialThemeMongooseRepository } from './repositories/mongoose/editorial-theme.mongoose.repository';
import { EditorialThemeRepository } from './repositories/editorial-theme.repository';
import { EditorialCalendarThemeVersionMongooseRepository } from './repositories/mongoose/editorial-calendar-theme-version.mongoose.repository';
import { EditorialCalendarThemeVersionRepository } from './repositories/editorial-calendar-theme-version.repository';
import { EditorialScriptMongooseRepository } from './repositories/mongoose/editorial-script.mongoose.repository';
import { EditorialScriptRepository } from './repositories/editorial-script.repository';
import { EditorialScriptVersionMongooseRepository } from './repositories/mongoose/editorial-script-version.mongoose.repository';
import { EditorialScriptVersionRepository } from './repositories/editorial-script-version.repository';
import { EditorialBrandStoryMongooseRepository } from './repositories/mongoose/editorial-brand-story.mongoose.repository';
import { EditorialBrandStoryRepository } from './repositories/editorial-brand-story.repository';
import { EditorialTaskMongooseRepository } from './repositories/mongoose/editorial-task.mongoose.repository';
import { EditorialTaskRepository } from './repositories/editorial-task.repository';
import { EditorialActivityMongooseRepository } from './repositories/mongoose/editorial-activity.mongoose.repository';
import { EditorialActivityRepository } from './repositories/editorial-activity.repository';

import { ThemeGenerator } from './generators/theme-generator';
import { StubThemeGenerator } from './generators/stub-theme.generator';
import { ScriptGenerator } from './generators/script-generator';
import { StubScriptGenerator } from './generators/stub-script.generator';
import { MapaGenerator } from './generators/mapa-generator';
import { StubMapaGenerator } from './generators/stub-mapa.generator';
import { CalendarGenerator } from './generators/calendar-generator';
import { StubCalendarGenerator } from './generators/stub-calendar.generator';
import { WorkspaceAdvisorGenerator } from './generators/workspace-advisor.generator';
import { StubWorkspaceAdvisorGenerator } from './generators/stub-workspace-advisor.generator';

import { EditorialProjectController } from './controllers/editorial-project.controller';
import { EditorialVersionController } from './controllers/editorial-version.controller';
import { EditorialCalendarController } from './controllers/editorial-calendar.controller';
import { EditorialThemeController } from './controllers/editorial-theme.controller';
import { EditorialScriptController } from './controllers/editorial-script.controller';
import { EditorialWorkspaceController } from './controllers/editorial-workspace.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: EditorialProject.name, schema: EditorialProjectSchema },
      { name: EditorialVersion.name, schema: EditorialVersionSchema },
      { name: EditorialMapa.name, schema: EditorialMapaSchema },
      { name: EditorialCalendar.name, schema: EditorialCalendarSchema },
      { name: EditorialTheme.name, schema: EditorialThemeSchema },
      {
        name: EditorialCalendarThemeVersion.name,
        schema: EditorialCalendarThemeVersionSchema,
      },
      { name: EditorialScript.name, schema: EditorialScriptSchema },
      {
        name: EditorialScriptVersion.name,
        schema: EditorialScriptVersionSchema,
      },
      { name: EditorialBrandStory.name, schema: EditorialBrandStorySchema },
      { name: EditorialTask.name, schema: EditorialTaskSchema },
      {
        name: EditorialActivityLog.name,
        schema: EditorialActivityLogSchema,
      },
    ]),
  ],
  controllers: [
    EditorialProjectController,
    EditorialVersionController,
    EditorialCalendarController,
    EditorialThemeController,
    EditorialScriptController,
    EditorialWorkspaceController,
  ],
  providers: [
    EditorialProjectService,
    EditorialVersionService,
    EditorialCalendarService,
    EditorialThemeService,
    EditorialScriptService,
    EditorialBrandStoryService,
    EditorialWorkspaceService,
    EditorialEventListener,
    {
      provide: ThemeGenerator,
      useClass: StubThemeGenerator,
    },
    {
      provide: ScriptGenerator,
      useClass: StubScriptGenerator,
    },
    {
      provide: MapaGenerator,
      useClass: StubMapaGenerator,
    },
    {
      provide: CalendarGenerator,
      useClass: StubCalendarGenerator,
    },
    {
      provide: WorkspaceAdvisorGenerator,
      useClass: StubWorkspaceAdvisorGenerator,
    },
    {
      provide: EditorialProjectRepository,
      useClass: EditorialProjectMongooseRepository,
    },
    {
      provide: EditorialVersionRepository,
      useClass: EditorialVersionMongooseRepository,
    },
    {
      provide: EditorialMapaRepository,
      useClass: EditorialMapaMongooseRepository,
    },
    {
      provide: EditorialCalendarRepository,
      useClass: EditorialCalendarMongooseRepository,
    },
    {
      provide: EditorialThemeRepository,
      useClass: EditorialThemeMongooseRepository,
    },
    {
      provide: EditorialCalendarThemeVersionRepository,
      useClass: EditorialCalendarThemeVersionMongooseRepository,
    },
    {
      provide: EditorialScriptRepository,
      useClass: EditorialScriptMongooseRepository,
    },
    {
      provide: EditorialScriptVersionRepository,
      useClass: EditorialScriptVersionMongooseRepository,
    },
    {
      provide: EditorialBrandStoryRepository,
      useClass: EditorialBrandStoryMongooseRepository,
    },
    {
      provide: EditorialTaskRepository,
      useClass: EditorialTaskMongooseRepository,
    },
    {
      provide: EditorialActivityRepository,
      useClass: EditorialActivityMongooseRepository,
    },
  ],
  exports: [
    EditorialProjectService,
    EditorialVersionService,
    EditorialCalendarService,
    EditorialThemeService,
    EditorialScriptService,
    EditorialBrandStoryService,
    EditorialWorkspaceService,
  ],
})
export class EditorialModule {}
