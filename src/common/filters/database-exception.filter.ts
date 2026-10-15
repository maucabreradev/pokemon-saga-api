import { ExceptionFilter, Catch, ArgumentsHost, Logger } from '@nestjs/common';
import { Request, Response } from 'express';

interface ErrorResponse {
  statusCode: number;
  message: string;
  error: string;
  timestamp: string;
  path: string;
}

interface PostgresError extends Error {
  code?: string;
  detail?: string;
  constraint?: string;
  table?: string;
  column?: string;
}

const isPostgresError = (error: unknown): error is PostgresError => {
  return error instanceof Error && typeof (error as PostgresError).code === 'string';
};

@Catch()
export class DatabaseExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(DatabaseExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    if (!isPostgresError(exception)) {
      return;
    }

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const errorResponse = this.buildErrorResponse(exception);

    this.logger.error(
      `DB Error: ${request.method} ${request.url} - ${errorResponse.message}`,
      exception.stack,
    );

    response.status(errorResponse.statusCode).json(errorResponse);
  }

  private buildErrorResponse(exception: PostgresError): ErrorResponse {
    const code = exception.code;

    const defaultResponse: ErrorResponse = {
      statusCode: 500,
      message: 'Database error occurred',
      error: 'DATABASE_ERROR',
      timestamp: new Date().toISOString(),
      path: '',
    };

    switch (code) {
      case '23505': // unique_violation
        return {
          ...defaultResponse,
          statusCode: 409,
          message: 'A record with this value already exists',
          error: 'CONFLICT',
        };
      case '23503': // foreign_key_violation
        return {
          ...defaultResponse,
          statusCode: 400,
          message: 'Referenced record does not exist',
          error: 'BAD_REQUEST',
        };
      case '23502': // not_null_violation
        return {
          ...defaultResponse,
          statusCode: 400,
          message: 'Required field is missing',
          error: 'BAD_REQUEST',
        };
      case '23514': // check_violation
        return {
          ...defaultResponse,
          statusCode: 400,
          message: 'Data violates a constraint',
          error: 'BAD_REQUEST',
        };
      case '42P01': // undefined_table
        return {
          ...defaultResponse,
          statusCode: 500,
          message: 'Database schema error',
          error: 'INTERNAL_SERVER_ERROR',
        };
      default:
        return defaultResponse;
    }
  }
}
