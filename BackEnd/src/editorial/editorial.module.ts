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
import { EditorialProjectService } from './services/editorial-project.service';
import { EditorialVersionService } from './services/editorial-version.service';
import { EditorialEventListener } from './services/editorial-event.listener';
import { EditorialProjectMongooseRepository } from './repositories/mongoose/editorial-project.mongoose.repository';
import { EditorialProjectRepository } from './repositories/editorial-project.repository';
import { EditorialVersionMongooseRepository } from './repositories/mongoose/editorial-version.mongoose.repository';
import { EditorialVersionRepository } from './repositories/editorial-version.repository';
import { EditorialMapaMongooseRepository } from './repositories/mongoose/editorial-mapa.mongoose.repository';
import { EditorialMapaRepository } from './repositories/editorial-mapa.repository';
import { EditorialProjectController } from './controllers/editorial-project.controller';
import { EditorialVersionController } from './controllers/editorial-version.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: EditorialProject.name, schema: EditorialProjectSchema },
      { name: EditorialVersion.name, schema: EditorialVersionSchema },
      { name: EditorialMapa.name, schema: EditorialMapaSchema },
    ]),
  ],
  controllers: [EditorialProjectController, EditorialVersionController],
  providers: [
    EditorialProjectService,
    EditorialVersionService,
    EditorialEventListener,
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
  ],
})
export class EditorialModule {}