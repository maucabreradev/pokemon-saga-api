import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthGuard } from './guards/auth.guard';

// Matches validation.schema.ts: /^\d+[mhd]$/ (e.g. '15m', '1h', '30d').
// The cast is safe because ConfigModule validates the pattern at boot.
type TokenExpiry = `${number}${'m' | 'h' | 'd'}`;

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('jwt.secret'),
        signOptions: {
          expiresIn: configService.getOrThrow<string>('jwt.accessTokenExpiry') as TokenExpiry,
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AuthModule {}
