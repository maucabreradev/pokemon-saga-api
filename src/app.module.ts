import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { CharactersModule } from './characters/characters.module';
import { DatabaseModule } from './database/database.module';
import { ForumsModule } from './forums/forums.module';
import { HealthModule } from './health/health.module';
import { UsersModule } from './users/users.module';
import { applyRateLimiting, getThrottlerGlobalGuardProvider } from './config/rate-limit.config';
import {
  configuration,
  databaseConfig,
  jwtConfig,
  rateLimitConfig,
  validationSchema,
} from './config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration, databaseConfig, jwtConfig, rateLimitConfig],
      validationSchema,
      envFilePath: ['.env.local', '.env'],
    }),
    DatabaseModule,
    HealthModule,
    AuthModule,
    UsersModule,
    CharactersModule,
    ForumsModule,
    applyRateLimiting(),
  ],
  controllers: [],
  providers: [getThrottlerGlobalGuardProvider()],
})
export class AppModule {}
