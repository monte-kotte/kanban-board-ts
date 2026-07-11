import {
  ArgumentsHost,
  Catch,
  ConflictException,
  ExceptionFilter,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    switch (exception.code) {
      case 'P2002':
        return this.handle(
          host,
          new ConflictException('A record with the same unique value already exists'),
        );
      case 'P2003':
        return this.handle(
          host,
          new ConflictException(
            'This record cannot be deleted or saved because it is referenced by other records',
          ),
        );
      case 'P2025':
        return this.handle(host, new NotFoundException('Record not found'));
      default:
        throw exception;
    }
  }

  private handle(host: ArgumentsHost, exception: ConflictException | NotFoundException) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const status = exception.getStatus();
    response.status(status).json(exception.getResponse());
  }
}
