import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';

let cachedServer: any;

async function bootstrapServer() {
  if (!cachedServer) {
    let AppModule;
    try {
      // Import compiled dist module first (emitted with NestJS decorator metadata)
      AppModule = require('../packages/backend/dist/app.module').AppModule;
    } catch (e) {
      AppModule = require('../packages/backend/src/app.module').AppModule;
    }

    const app = await NestFactory.create(AppModule);
    app.enableCors();
    await app.init();
    cachedServer = app.getHttpAdapter().getInstance();
  }
  return cachedServer;
}

export default async function handler(req: any, res: any) {
  const server = await bootstrapServer();
  server(req, res);
}
