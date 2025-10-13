import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
import { GlobalHttpExceptionFilter } from './common/filters/http-exception.filter';
import { HttpErrorFilter } from './filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: false });

  const ORIGINS: (string | RegExp)[] = [
    process.env.WEB_ORIGIN ?? 'http://localhost:3000',
  ];
  if (process.env.NODE_ENV !== 'production') {
    ORIGINS.push(/\.vercel\.app$/);
  }

  app.enableCors({
    origin: ORIGINS,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Request-Id',
      'x-csrf',
      'x-dev-auth', // Mock Verify
    ],
  });

  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalFilters(new HttpErrorFilter());

  await app.listen(4000);
  console.log('🚀 Backend ready on http://localhost:4000');
}
bootstrap();
