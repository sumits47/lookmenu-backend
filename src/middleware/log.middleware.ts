import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LogMiddleware implements NestMiddleware {
  private logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction) {
    const { ip, method, originalUrl: url } = req;
    const userAgent = req.get('user-agent') || '';
    const start = Date.now();

    res.on('close', () => {
      const { statusCode } = res;
      const contentLength = res.get('content-length');
      const end = Date.now();
      const responseTime = `${end - start}ms`;

      this.logger.log(
        `${method} ${url} ${statusCode} ${responseTime} ${contentLength} - ${userAgent} ${ip}`,
      );
    });

    next();
  }
}
