// import { Module } from '@nestjs/common';
// import { HttpModule } from '@nestjs/axios';
// import { TranscriptionController } from './transcription.controller';
// import { TranscriptionService } from './transcription.service';

// @Module({
//   imports: [HttpModule],
//   controllers: [TranscriptionController],
//   providers: [TranscriptionService],
// })
// export class TranscriptionModule {}

import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { TranscriptionController } from './transcription.controller';
import { TranscriptionService } from './transcription.service';

@Module({
  imports: [HttpModule, ConfigModule],
  controllers: [TranscriptionController],
  providers: [TranscriptionService],
})
export class TranscriptionModule {}
