import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import { AppModule } from '../packages/backend/src/app.module';

const expressApp = express();
let isInitialized = false;

async function bootstrap() {
  if (!isInitialized) {
    const nestApp = await NestFactory.create(
      AppModule,
      new ExpressAdapter(expressApp),
    );
    nestApp.enableCors();
    await nestApp.init();
    isInitialized = true;
  }
}

export default async function handler(req: any, res: any) {
  try {
    await bootstrap();
    expressApp(req, res);
  } catch (err: any) {
    console.error('Vercel Serverless Function Error:', err);
    res.status(500).json({
      error: 'Internal Server Error',
      message: err?.message || String(err),
    });
  }
}
