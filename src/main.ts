import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { AbstractWsAdapter } from '@nestjs/websockets';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/v1/ostra-logistics_api')
  app.useGlobalPipes(new ValidationPipe)
  await app.listen(3000);
}
bootstrap();
