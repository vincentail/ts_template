/**
 * @description
 * @author yq
 * @date 2023/1/28 21:50
 */
import {
  CallHandler,
  ExecutionContext,
  HttpStatus,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import BaseResponse from '../response/baseResponse'
import { HttpArgumentsHost } from '@nestjs/common/interfaces/features/arguments-host.interface'
import { Request, Response } from 'express'
import { HttpRequest } from '../../../interfaces/httpRequest'

@Injectable()
export class RequestInterceptor implements NestInterceptor {
  private readonly logger = new Logger(RequestInterceptor.name)

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<BaseResponse> {
    const ctx: HttpArgumentsHost = context.switchToHttp()
    const request: HttpRequest = ctx.getRequest<Request>() as HttpRequest
    const response: Response = ctx.getResponse<Response>()
    return next.handle().pipe(
      map((data) => {
        this.logger.log(
          `request log: requestId: ${request.session.reqId}, traceId: ${
            request.session.traceId
          }, ${request.method} ${request.url} ${
            Date.now() - request.session.time
          }ms`,
        )
        response.status(HttpStatus.OK)
        return BaseResponse.SUCCESS.clone()
          .setData(data)
          .setLanguage(request.session.language)
      }),
    )
  }
}
