/**
 * @description proxy authorization guard
 * @author yq
 * @date 2023/1/29 00:34
 */
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Observable } from 'rxjs'
import { ApiSignatureUtil } from '../../../utils/apiSignatureUtil'
import Config from '../../../config'
import BaseResponse from '../response/baseResponse'
import ErrorCode from '../response/errorCode'
import Validator from '../validator'

@Injectable()
export class ProxyAuthGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest()
    const timestamp = request.query.timestamp || request.body.timestamp
    const recvWindow = request.query.recvWindow || request.body.recvWindow
    const salt = request.query.salt || request.body.salt
    // check ip todo:
    Validator.checkTimestamp(
      timestamp,
      BaseResponse.create(ErrorCode.INVALID_TIMESTAMP),
    )
      .checkNumber(
        recvWindow,
        { min: 1, max: 60000 },
        BaseResponse.create(ErrorCode.INVALID_RECV_WINDOW),
      )
      .checkString(
        salt,
        {
          minLen: 1,
          maxLen: 128,
        },
        BaseResponse.create(ErrorCode.INVALID_SALT),
      )
    if (Date.now() - Number(timestamp) > Number(recvWindow)) {
      throw BaseResponse.create(ErrorCode.REQUEST_TIMEOUT)
    }
    const originalSignature = request.query.signature || request.body.signature
    const params = `${ApiSignatureUtil.getSignatureStr(
      request.query,
    )}${ApiSignatureUtil.getSignatureStr(request.body)}`
    const signature = ApiSignatureUtil.signature(
      params,
      Config.securityConfig.signatureSalt + salt,
    )
    if (signature !== originalSignature) {
      throw BaseResponse.create(ErrorCode.INVALID_SIGNATURE)
    }
    return true
  }
}
