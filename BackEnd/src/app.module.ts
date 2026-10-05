import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/user.module';
import { OrganizationModule } from './organization/organization.module';
import { StorageModule } from './storage/storage.module';
import { SharedModule } from './shared/shared.module';
import { EditorialModule } from './editorial/editorial.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    EventEmitterModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGO_URI),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN },
    }),
    UsersModule,
    AuthModule,
    EditorialModule,
    OrganizationModule,
    StorageModule,
    SharedModule,
  ],
  controllers: [AppController],
  providers: [AppService], // { provide: APP_GUARD, useClass: AuthGuard }],
})
export class AppModule {}
