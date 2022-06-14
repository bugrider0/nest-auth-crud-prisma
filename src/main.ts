import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';

(async () => {
    const app = await NestFactory.create(AppModule);

    const config = new DocumentBuilder()
        .setTitle('nest-auth-crud-prisma')
        .setDescription('nest-auth-crud-prisma')
        .setVersion('1.0')
        .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);

    await app.listen(8000);
})();
