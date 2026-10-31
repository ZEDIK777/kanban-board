import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'; // <-- Добавили

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));

  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  });

  // --- НАСТРОЙКА SWAGGER ---
  const config = new DocumentBuilder()
    .setTitle('Kanban API')
    .setDescription('Документация API для доски задач')
    .setVersion('1.0')
    .addBearerAuth() // Добавляет кнопку "Authorize" для вставки токена
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  // Говорим Swagger: "Доступен по адресу /api/docs"
  SwaggerModule.setup('api/docs', app, document);
  // -------------------------

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 Сервер запущен: http://localhost:${port}/api`);
  console.log(`📚 Swagger UI доступен по адресу: http://localhost:${port}/api/docs`);
}

bootstrap();