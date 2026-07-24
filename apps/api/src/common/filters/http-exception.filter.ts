import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Request, Response } from 'express';

interface ErrorResponseBody {
  success: false;
  statusCode: number;
  message: string;
  error: string;
  path: string;
  timestamp: string;
  details?: unknown;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const { statusCode, message, error, details } =
      this.resolveException(exception);

    const body: ErrorResponseBody = {
      success: false,
      statusCode,
      message,
      error,
      path: request.url,
      timestamp: new Date().toISOString(),
      ...(details ? { details } : {}),
    };

    const isServerError = statusCode >= 500;

    if (isServerError) {
      this.logger.error(
        `${request.method} ${request.url} -> ${statusCode}`,
        exception as Error,
      );
    } else {
      this.logger.warn(
        `${request.method} ${request.url} -> ${statusCode}: ${message}`,
      );
    }

    response.status(statusCode).json(body);
  }

  private resolveException(exception: unknown): {
    statusCode: number;
    message: string;
    error: string;
    details?: unknown;
  } {
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const response = exception.getResponse();

      if (typeof response === 'string') {
        return { statusCode: status, message: response, error: exception.name };
      }

      const responseObject = response as Record<string, unknown>;
      const message = (responseObject.message ?? exception.message) as
        string | string[];

      return {
        statusCode: status,
        message: Array.isArray(message) ? message.join(', ') : message,
        error: (responseObject.error as string) ?? exception.name,
        details: Array.isArray(message) ? message : undefined,
      };
    }

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      return this.resolvePrismaError(exception);
    }

    if (exception instanceof Prisma.PrismaClientValidationError) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Invalid request payload for the database operation.',
        error: 'BadRequest',
      };
    }

    const err = exception as Error;

    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: err?.message ?? 'Internal server error',
      error: 'InternalServerError',
    };
  }

  private resolvePrismaError(exception: Prisma.PrismaClientKnownRequestError): {
    statusCode: number;
    message: string;
    error: string;
  } {
    switch (exception.code) {
      case 'P2002':
        return {
          statusCode: HttpStatus.CONFLICT,
          message: `A record with this ${(exception.meta?.target as string[])?.join(', ') ?? 'value'} already exists.`,
          error: 'Conflict',
        };
      case 'P2025':
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'The requested resource could not be found.',
          error: 'NotFound',
        };
      case 'P2003':
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'This operation violates a foreign key constraint.',
          error: 'BadRequest',
        };
      default:
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: `Database error (${exception.code}).`,
          error: 'BadRequest',
        };
    }
  }
}
