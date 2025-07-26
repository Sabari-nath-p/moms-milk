import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { 
    logger: ['error', 'warn', 'log'],
    cors: true
  });

  // Security middleware
  app.use(helmet());
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100 // limit each IP to 100 requests per windowMs
    })
  );

  // Global pipes and security
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
  }));

  // Swagger configuration
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Mom\'s Milk API')
    .setDescription('API documentation for Mom\'s Milk breast milk donation platform')
    .setVersion('1.0')
    .addTag('auth', 'Authentication endpoints')
    .addTag('baby', 'Baby tracking and analytics')
    .addTag('donors', 'Donor management')
    .addTag('buyers', 'Buyer management')
    .addTag('requests', 'Milk donation requests')
    .addTag('notifications', 'Notification management')
    .addBearerAuth()
    .build();

  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, swaggerDocument);

  // API Documentation
  const config = new DocumentBuilder()
    .setTitle('Moms Milk API')
    .setDescription('API documentation for Moms Milk - Breast Milk Donation Platform')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Enable CORS
  app.enableCors();

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
