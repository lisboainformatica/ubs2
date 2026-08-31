import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  // Validate required JWT_SECRET at startup (Etapa 2)
  if (!process.env.JWT_SECRET) {
    console.error('FATAL: A variável de ambiente JWT_SECRET não está definida.');
    process.exit(1);
  }

  const app = await NestFactory.create(AppModule);

  // Enable CORS based on environment (Etapa 21)
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  app.enableCors({
    origin: frontendUrl,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Enable Validation globally
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    })
  );

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`UBS Backend rodando na porta ${port}`);
}
bootstrap();
