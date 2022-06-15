import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';

import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ATGuard } from './common/guards';

@Module({
    imports: [PrismaModule, AuthModule],
    providers: [
        {
            provide: APP_GUARD,
            useClass: ATGuard,
        },
    ],
})
export class AppModule {}
