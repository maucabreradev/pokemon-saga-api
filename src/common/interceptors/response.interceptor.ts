import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable, map } from 'rxjs';

export interface Response<T> {
  data: T;
  meta?: {
    timestamp: string;
    path: string;
    duration?: string;
  };
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, Response<T>> {
  private readonly logger = new Logger(ResponseInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    const request = context.switchToHttp().getRequest();
    const startTime = Date.now();

    return next.handle().pipe(
      map((data) => {
        const duration = Date.now() - startTime;

        // Don't wrap if already wrapped or if it's a file download
        if (data && typeof data === 'object' && 'data' in data && 'meta' in data) {
          return data;
        }

        return {
          data,
          meta: {
            timestamp: new Date().toISOString(),
            path: request.url,
            duration: `${duration}ms`,
          },
        };
      }),
    );
  }
}
