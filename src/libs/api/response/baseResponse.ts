/*
 * @description base response
 * @authors yq
 * @date 2022-10-30 16:06:44
 */
import ErrorCode from './errorCode'
import ErrorMsgUtil from './errorMsgUtil'

export default class BaseResponse {
  private code: string
  private msg: string
  private data?: any
  private timestamp: number
  private extras?: any
  public static SUCCESS: BaseResponse = BaseResponse.create(ErrorCode.SUCCESS)

  constructor(code: string, msg?: string, data?: any) {
    this.code = code || ErrorCode.UNKNOWN_ERROR
    this.msg = msg || ErrorMsgUtil.getMsg(this.code)
    this.data = data
    this.timestamp = Date.now()
  }

  /**
   * 创建返回信息
   *
   * @param {Number} code 状态码
   * @param {String} msg 描述
   * @param {Object} [data] 返回数据信息
   *
   * @returns {BaseResponse}
   * @public
   */
  public static create(code: string, msg?: string, data?: any) {
    return new BaseResponse(code, msg, data)
  }

  /**
   * 深度克隆返回信息
   *
   * @returns {BaseResponse}
   * @public
   */
  public clone() {
    return new BaseResponse(this.code, this.msg, this.data)
  }

  public setExtras(extras: any) {
    this.extras = extras
    return this
  }

  public setLanguage(language = 'en') {
    // code码小于0时直接返回错误信息
    if (Number(this.code) < 0) return this
    this.msg = ErrorMsgUtil.getMsg(this.code, language) || this.msg
    this.formatMsg()
    return this
  }

  public setCode(code: string) {
    this.code = code
    return this
  }

  public getCode() {
    return this.code
  }

  public setMsg(msg: string) {
    this.msg = msg
    return this
  }

  public getMsg() {
    return this.msg
  }

  public formatMsg() {
    if (this.extras && typeof this.extras === 'object') {
      Object.keys(this.extras).forEach((key) => {
        this.msg = this.msg.replace(
          new RegExp(`\\$${key}`, 'g'),
          this.extras[key] || '',
        )
      })
      // remove the extras field
      this.extras = undefined
    }
    return this
  }

  public setData(data: any) {
    this.data = data
    return this
  }

  public getData() {
    return this.data
  }

  public setTimestamp(timestamp: number) {
    this.timestamp = timestamp
    return this
  }
}
