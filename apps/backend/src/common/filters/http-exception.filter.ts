import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

@Catch()
export class GlobalHttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse();
    let status = HttpStatus.INTERNAL_SERVER_ERROR;

    // Default-Shape
    let body: any = { code: 'internal_error', message: 'Unexpected error' };

    if (exception instanceof HttpException) {
      status = exception.getStatus?.() ?? status;
      const resp = exception.getResponse?.() as any;

      // Mögliche Formen normalisieren
      const message =
        (typeof resp === 'string' && resp) ||
        resp?.message ||
        exception.message ||
        HttpStatus[status] ||
        'Error';

      // ValidationPipe liefert unser { code:'validation_error', ... } bereits fertig
      const code =
        resp?.code ||
        (status === 401
          ? 'unauthorized'
          : status === 403
            ? 'forbidden'
            : status === 404
              ? 'not_found'
              : status === 429
                ? 'too_many_requests'
                : status === 400
                  ? 'bad_request'
                  : 'http_error');

      body = {
        code,
        message,
        ...(resp?.details ? { details: resp.details } : {}),
      };
    }

    res.status(status).json(body);
  }
}
