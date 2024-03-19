/**
 * @description api signature util
 * @author yq
 * @date 2023/1/28 13:43
 */
import crypto from 'crypto'

export class ApiSignatureUtil {
  /**
   * get sig
   * @param params
   * @returns {string}
   */
  public static getSignatureStr(params) {
    return Object.keys(params)
      .filter((k) => k !== 'signature')
      .map((k) => {
        let data = params[k]
        if (!data && typeof data !== 'number' && typeof data !== 'boolean') {
          data = ''
        }
        if (Array.prototype.toString.call(data) !== '[object String]') {
          data = JSON.stringify(data)
        }
        return `${k}=${data}`
      })
      .sort()
      .join('&')
  }

  /**
   * signature
   * @param data
   * @param secretKey
   */
  public static signature(data, secretKey) {
    return crypto
      .createHmac('sha256', secretKey)
      .update(data, 'utf8')
      .digest('hex')
  }
}
