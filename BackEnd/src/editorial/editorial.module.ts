import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  EditorialProject,
  EditorialProjectSchema,
} from './schemas/editorial-project.schema';
import { EditorialProjectService } from './services/editorial-project.service';
import { EditorialProjectMongooseRepository } from './repositories/mongoose/editorial-project.mongoose.repository';
import { EditorialProjectRepository } from './repositories/editorial-project.repository';
import { EditorialProjectController } from './controllers/editorial-project.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: EditorialProject.name, schema: EditorialProjectSchema },
    ]),
  ],
  controllers: [EditorialProjectController],
  providers: [
    EditorialProjectService,
    {
      provide: EditorialProjectRepository,
      useClass: EditorialProjectMongooseRepository,
    },
  ],
})
export class EditorialModule {}
