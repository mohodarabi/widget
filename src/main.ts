import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import * as mongoSanitize from 'express-mongo-sanitize';
const xss = require('xss-clean');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(xss());
  app.use(mongoSanitize());

  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  await app.listen(3005);
}

bootstrap();
