import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { CharactersModule } from './characters/characters.module';
import { DatabaseModule } from './database/database.module';
import { FriendshipsModule } from './friendships/friendships.module';
import { ForumsModule } from './forums/forums.module';
import { HealthModule } from './health/health.module';
import { PostsModule } from './posts/posts.module';
import { TopicsModule } from './topics/topics.module';
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
    TopicsModule,
    PostsModule,
    FriendshipsModule,
    applyRateLimiting(),
  ],
  controllers: [],
  providers: [getThrottlerGlobalGuardProvider()],
})
export class AppModule {}
