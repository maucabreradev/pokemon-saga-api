import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { ValidationPipe as CustomValidationPipe } from './common/pipes/validation.pipe';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global prefix
  app.setGlobalPrefix('api/v1');

  // CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  });

  // Global pipes
  app.useGlobalPipes(
    new CustomValidationPipe(),
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global interceptors
  app.useGlobalInterceptors(new ResponseInterceptor());

  // Global exception filters
  app.useGlobalFilters(new AllExceptionsFilter());

  // Swagger/OpenAPI Documentation
  const config = new DocumentBuilder()
    .setTitle('Pokémon Saga API')
    .setDescription('REST API for a Pokémon role-playing forum')
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Enter JWT access token',
        in: 'header',
      },
      'access-token',
    )
    .addServer('http://localhost:3000', 'Local Development')
    .addTag('Health', 'Health check endpoints')
    .addTag('Auth', 'Authentication endpoints')
    .addTag('Users', 'User management endpoints')
    .addTag('Characters', 'Character management endpoints')
    .addTag('Forums', 'Forum management endpoints')
    .addTag('Topics', 'Topic management endpoints')
    .addTag('Posts', 'Post management endpoints')
    .addTag('Friendships', 'Friendship management endpoints')
    .addTag('Reactions', 'Reaction management endpoints')
    .addTag('Moderation', 'Moderation endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      filter: true,
      showExtensions: true,
      showCommonExtensions: true,
    },
    customSiteTitle: 'Pokémon Saga API Documentation',
    customCss: '.swagger-ui .topbar { display: none }',
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}/api/v1`);
  console.log(`Swagger documentation: http://localhost:${port}/api/docs`);
}

bootstrap();
