/**
 * @description http exception filter
 * @author yq
 * @date 2023/1/27 09:33
 */
import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
} from '@nestjs/common'
import BaseResponse from '../response/baseResponse'
import ErrorCode from '../response/errorCode'
import { Request, Response } from 'express'
import { HttpArgumentsHost } from '@nestjs/common/interfaces/features/arguments-host.interface'
import { HttpRequest } from '../../../interfaces/httpRequest'

@Catch()
export default class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name)

  catch(err: any, host: ArgumentsHost) {
    err = err || {
      code: -1,
      message: 'Unknown error',
    }
    const ctx: HttpArgumentsHost = host.switchToHttp()
    const response: Response = ctx.getResponse<Response>()
    const request: HttpRequest = ctx.getRequest<Request>() as HttpRequest

    request.session = request.session || { time: 0 }
    const logStr = `request log: requestId: ${
      request.session.reqId
    }, traceId: ${request.session.traceId}, ${request.method} ${request.url} ${
      Date.now() - request.session.time
    }ms`
    if (err instanceof BaseResponse) {
      this.logger.log(`${logStr} response: ${JSON.stringify(err)}`)
      if (
        err.getCode() === ErrorCode.UNKNOWN_ERROR ||
        err.getCode() === ErrorCode.UNKNOWN_CUSTOM_ERROR ||
        err.getCode() === ErrorCode.SERVER_ERROR ||
        err.getCode() === ErrorCode.SYSTEM_MAINTENANCE
      ) {
        response
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .json(err.setLanguage(request.session.language))
        return
      }
      response
        .status(HttpStatus.BAD_REQUEST)
        .json(err.setLanguage(request.session.language))
      return
    }
    if (err instanceof BadRequestException) {
      this.logger.log(`${logStr} response: ${err.message || ''}`)
      response
        .status(HttpStatus.BAD_REQUEST)
        .json(BaseResponse.create(ErrorCode.CUSTOM_ERROR, err.message))
      return
    }
    if (err.response && err.response.statusCode === 404) {
      response
        .status(err.getStatus())
        .json(
          BaseResponse.create(ErrorCode.NOT_FOUND).setLanguage(
            request.session.language,
          ),
        )
      return
    }
    this.logger.error(
      `system error, ${logStr}, msg: ${err.message || 'Unknown Error'}`,
      err,
    )
    response
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json(
        BaseResponse.create(ErrorCode.SERVER_ERROR).setLanguage(
          request.session.language,
        ),
      )
  }
}
