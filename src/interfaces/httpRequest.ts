/**
 * interface for http request
 * @author yq
 * @version 25/12/2023 15:30
 */
import { Request } from 'express'

export interface HttpRequest extends Request {
  session: {
    reqId: string
    traceId: string
    time: number
    language: string
  }
}
