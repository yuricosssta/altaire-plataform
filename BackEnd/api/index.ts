import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { Server } from 'http';
import { createServer, proxy } from 'vercel-node-serverless';

let cachedServer: Server;

export default async function handler(req: any, res: any) {
  if (!cachedServer) {
    const app = await NestFactory.create(AppModule);
    await app.init();
    const nestServer = app.getHttpAdapter().getInstance();
    cachedServer = createServer(nestServer);
  }
  // The 'proxy' function from 'vercel-node-serverless' likely handles the request forwarding.
  // The exact return might not be necessary depending on the Vercel environment.
  return proxy(req, res, cachedServer);
}
