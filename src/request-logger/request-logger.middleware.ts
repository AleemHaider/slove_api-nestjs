import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger();
  use(req: Request, res: Response, next: NextFunction) {
    const { ip, method, originalUrl } = req;
    const userAgent = req.get('user-agent') || '';

    res.on('finish', () => {
      const msg = `${ip} ${method} ${originalUrl}  ${userAgent}`;
      this.logger.log(msg);

      const statusCode = res.statusCode;
      if (statusCode === 401 || statusCode === 404 || statusCode === 405) {
        this.logger.warn(`[${req.method}] ${req.url} - ${statusCode}`);
      }
    });

    next();
  }
}
