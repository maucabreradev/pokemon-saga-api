import * as Joi from 'joi';

export const validationSchema = Joi.object({
  // Database
  DATABASE_URL: Joi.string().uri().required().description('PostgreSQL connection URL'),

  // JWT
  JWT_SECRET: Joi.string().min(32).required().description('JWT secret key (min 32 characters)'),
  JWT_EXPIRY: Joi.string()
    .pattern(/^\d+[mhd]$/)
    .default('15m')
    .description('Access token expiry (e.g., 15m, 1h, 1d)'),
  JWT_REFRESH_EXPIRY: Joi.string()
    .pattern(/^\d+[mhd]$/)
    .default('30d')
    .description('Refresh token expiry (e.g., 30d)'),

  // Server
  PORT: Joi.number().port().default(3000).description('Server port'),
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development')
    .description('Node environment'),
  CORS_ORIGIN: Joi.string()
    .uri()
    .default('http://localhost:3000')
    .description('CORS allowed origin'),

  // Database pool
  DB_POOL_SIZE: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(10)
    .description('Database connection pool size'),

  // Rate limiting
  RATE_LIMIT_TTL: Joi.number()
    .integer()
    .min(1)
    .default(60)
    .description('Rate limit window in seconds'),
  RATE_LIMIT_MAX: Joi.number()
    .integer()
    .min(1)
    .default(100)
    .description('Max requests per rate limit window'),
}).unknown(true);
