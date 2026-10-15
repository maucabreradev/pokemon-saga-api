import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

interface ValidatableType {
  new (...args: unknown[]): object;
}

@Injectable()
export class ValidationPipe implements PipeTransform<unknown> {
  async transform(value: unknown, { metatype }: ArgumentMetadata): Promise<unknown> {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    const object = plainToInstance(metatype, value, { enableImplicitConversion: true });
    const errors = await validate(object, {
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      enableDebugMessages: false,
    });

    if (errors.length > 0) {
      const messages = this.formatErrors(errors);
      throw new BadRequestException({
        statusCode: 400,
        message: messages,
        error: 'Bad Request',
        timestamp: new Date().toISOString(),
      });
    }

    return object;
  }

  private toValidate(metatype: ValidatableType): boolean {
    const types: ValidatableType[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }

  private formatErrors(errors: unknown[]): string[] {
    return errors.flatMap((error: unknown) => {
      const err = error as Record<string, unknown>;
      if (err.constraints) {
        return Object.values(err.constraints as Record<string, string>);
      }
      if (err.children && Array.isArray(err.children) && err.children.length > 0) {
        return this.formatErrors(err.children as unknown[]);
      }
      return [`Validation failed for ${String(err.property)}`];
    });
  }
}
