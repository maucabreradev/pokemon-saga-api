import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { HealthModule } from './health/health.module';
import { applyRateLimiting, getThrottlerGlobalGuardProvider } from './config/rate-limit.config';
import { configuration, validationSchema } from './config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema,
      envFilePath: ['.env.local', '.env'],
    }),
    DatabaseModule,
    HealthModule,
    applyRateLimiting(),
  ],
  controllers: [AppController],
  providers: [AppService, getThrottlerGlobalGuardProvider()],
})
export class AppModule {}
