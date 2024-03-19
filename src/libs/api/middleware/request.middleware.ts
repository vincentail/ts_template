/**
 * @description request middleware
 * @author yq
 * @date 2023/1/30 19:53
 */
import { NextFunction, Request, Response } from 'express'
import CommonUtil from '../../../utils/commonUtil'
import { Injectable, Logger, NestMiddleware } from '@nestjs/common'

@Injectable()
export class RequestMiddleware implements NestMiddleware {
  private readonly logger = new Logger(RequestMiddleware.name)

  use(req: Request | any, res: Response, next: NextFunction) {
    req.session = {
      time: Date.now(),
      reqId: CommonUtil.getUuid(),
      traceId: req.headers['x-trace-id'] || '',
      language: req.headers['lang'] || 'en',
    }
    if (req.originalUrl && !req.originalUrl.includes('/sql')) {
      this.logger.log(
        `request receive log: requestId: ${req.session.reqId}, traceId: ${
          req.session.traceId
        }, ${req.method} ${req.originalUrl}, params: ${JSON.stringify({
          ...(req.query || {}),
          ...(req.body || {}),
        })}`,
      )
    }
    next()
  }
}
