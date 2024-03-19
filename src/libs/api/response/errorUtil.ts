/**
 * @description error util
 * @author yq
 * @date 2022/10/30 12:23
 */
import Config from '../../../config'
import getLogger from '../../../utils/logger'
import ErrorMsgUtil from './errorMsgUtil'
import ErrorCode from './errorCode'

const Logger = getLogger('error-util')

export interface ErrorDetail {
  errorCode: string
  errorMsg: string
  error: string
}

export default class ErrorUtil {
  /**
   * format error
   * @param error
   */
  static formatErrorMsg(error: string): string {
    const regexes = Object.keys(Config.web3Config.failureErrorRegexMapping)
    for (const regex of regexes) {
      if (new RegExp(regex).test(error)) {
        return Config.web3Config.failureErrorRegexMapping[regex]
      }
    }
    return error
  }

  /**
   * get order error
   * @param error
   */
  static getOrderError(error: string): ErrorDetail {
    const regexError = ErrorUtil.formatErrorMsg(error)
    const errorCode =
      Config.appConfig.errorMsgToCodeMapping[regexError] ||
      ErrorCode.TRANSACTION_FAILED
    const errorMsg = ErrorMsgUtil.getMsg(errorCode)
    return {
      errorCode,
      errorMsg,
      error,
    } as ErrorDetail
  }

  /**
   * Check if the error is an unknown error
   * @param error
   */
  static isUnknown(error: string): boolean {
    const regexError = ErrorUtil.formatErrorMsg(error)
    const errorCode =
      Config.appConfig.errorMsgToCodeMapping[regexError] || ErrorCode.UNKNOWN
    if (errorCode !== ErrorCode.UNKNOWN) {
      return false
    }

    const regexes = Config.web3Config.unknownErrorRegexes
    for (const regex of regexes) {
      if (new RegExp(regex).test(error)) {
        return true
      }
    }

    Logger.error(`new unknown error: ${error}`)

    return true
  }
}
