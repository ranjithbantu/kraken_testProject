import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.listen(3000, () => {
    console.log('Nest.js application is listening on port 3000');
  });

}
bootstrap();
