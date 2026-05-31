import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import {
  ConflictError,
  DomainError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from '@domain/common/errors';

@Catch()
export class DomainExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      response.status(status).json({
        statusCode: status,
        message: exception.message,
      });
      return;
    }

    if (exception instanceof ValidationError) {
      response.status(HttpStatus.UNPROCESSABLE_ENTITY).json({
        statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        message: exception.message,
      });
      return;
    }

    if (exception instanceof ConflictError) {
      response.status(HttpStatus.CONFLICT).json({
        statusCode: HttpStatus.CONFLICT,
        message: exception.message,
      });
      return;
    }

    if (exception instanceof UnauthorizedError) {
      response.status(HttpStatus.UNAUTHORIZED).json({
        statusCode: HttpStatus.UNAUTHORIZED,
        message: exception.message,
      });
      return;
    }

    if (exception instanceof NotFoundError) {
      response.status(HttpStatus.NOT_FOUND).json({
        statusCode: HttpStatus.NOT_FOUND,
        message: exception.message,
      });
      return;
    }

    if (exception instanceof DomainError) {
      response.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        message: exception.message,
      });
      return;
    }

    console.error(exception);
    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Erro interno no servidor',
    });
  }
}
