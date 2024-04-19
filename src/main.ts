import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { AbstractWsAdapter } from '@nestjs/websockets';
import * as express from 'express'
import { join } from 'path';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/v1/ostra-logistics_api')
  app.useGlobalPipes(new ValidationPipe)
  app.use('/public',express.static(join(__dirname,'..','public')))
  await app.listen(3000);
}
bootstrap();
