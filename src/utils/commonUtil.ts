/*
 * @description common utils
 * @authors yq
 * @date 2022-10-12 14:33:54
 */
import { v4 as UUID } from 'uuid'
import crypto from 'crypto'
import BigNumber from 'bignumber.js'

const RANDOM_CHARS =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
const RANDOM_NUMBERS = '0123456789'

export default class CommonUtil {
  /**
   * generate random string，can generate salt
   * @returns {string}
   */
  static getRandomString(len = 16, chars = RANDOM_CHARS): string {
    const rnd = crypto.randomBytes(len)
    const value = new Array(len)
    const randomLen = Math.min(256, chars.length)
    const d = 256 / randomLen

    for (let i = 0; i < len; i += 1) {
      value[i] = chars[Math.floor(rnd[i] / d)]
    }

    return value.join('')
  }

  /**
   * generate verify code
   * @returns {string}
   */
  getVerifyCode(len = 6) {
    return CommonUtil.getRandomString(len, RANDOM_NUMBERS)
  }

  /**
   * generate UUID
   * @param separator whether need -
   * @returns {*}
   */
  static getUuid(separator = false) {
    if (separator) return UUID()
    return UUID().replace(/-/g, '')
  }

  /**
   * get endpoint
   * @param providerKey
   */
  static getEndpoint(providerKey): string {
    const result = /^(https?|wss):\/\/([\w-]+\.)+[\w-]+\/?/.exec(providerKey)
    return (result && result[0]) || ''
  }

  /**
   * format args to a string by delimiter
   * @param delimiter
   * @param args
   */
  static formatArgsToString(delimiter = '-', ...args): string {
    return args.join(delimiter)
  }

  /**
   * 保留有效数字，且清除末尾多余的零
   * @param num 字符串
   * @returns {*}
   */
  static decimalToString(num) {
    return new BigNumber(num).toFixed()
  }
}
