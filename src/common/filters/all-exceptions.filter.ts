import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AppError } from '../exceptions/app-errors';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const errorResponse = this.buildErrorResponse(exception, request);

    this.logger.error(
      `${request.method} ${request.url} - ${errorResponse.statusCode} - ${errorResponse.message}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    response.status(errorResponse.statusCode).json(errorResponse);
  }

  private buildErrorResponse(
    exception: unknown,
    request: Request,
  ): {
    statusCode: number;
    message: string | string[];
    error: string;
    timestamp: string;
    path: string;
  } {
    const timestamp = new Date().toISOString();
    const path = request.url;

    if (exception instanceof AppError) {
      return {
        statusCode: exception.statusCode,
        message: exception.message,
        error: exception.code,
        timestamp,
        path,
      };
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const response = exception.getResponse();

      return {
        statusCode: status,
        message:
          typeof response === 'string' ? response : (response as any).message || exception.message,
        error: exception.name,
        timestamp,
        path,
      };
    }

    if (exception instanceof Error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'An unexpected error occurred',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp,
        path,
      };
    }

    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'An unknown error occurred',
      error: 'UNKNOWN_ERROR',
      timestamp,
      path,
    };
  }
}
