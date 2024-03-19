/**
 * @description validator utils
 * @author yq
 * @date 2023/1/29 01:28
 */
import moment from 'moment'
import BigNumber from 'bignumber.js'
import BaseResponse from './response/baseResponse'
import Web3 from 'web3'

const dateFormatFullPattern =
  /^\d{4}-\d{2}-\d{2}( \d{2}:\d{2}(:\d{2})?)?(.\d{3})?$/
const UUID_REGEX = /^[0-9a-f]{8}(-?[0-9a-f]{4}){3}-?[0-9a-f]{12}$/

export default class Validator {
  /**
   * 校验字符串类型的字段是否合法
   *
   * @param {String} value 待校验的值
   * @param {Object} opts 校验选项
   *  - {Number} len 固定长度
   *  - {Number} maxLen 最大长度
   *  - {Number} minLen 最小长度
   *  - {RegExp} regex 需满足的正则表达式
   * @param {BaseResponse} err 错误
   *
   * @returns {Object} this
   * @public
   */
  static checkString(
    value: string,
    {
      len,
      maxLen,
      minLen,
      regex,
    }: {
      len?: number
      maxLen?: number
      minLen?: number
      regex?: RegExp
    } = {},
    err: BaseResponse,
  ) {
    if (
      (len && value.length !== len) ||
      (maxLen && value.length > maxLen) ||
      (minLen && value.length < minLen) ||
      (regex && !regex.test(value)) ||
      !value.trim()
    ) {
      throw err
    }

    return this
  }

  /**
   * 校验url
   *
   * @param {String} url 网址
   * @param {BaseResponse} err 错误
   *
   * @returns
   * @public
   */
  static checkUrl(url: string, err: BaseResponse) {
    return this.checkString(
      url,
      {
        maxLen: 256,
        regex: /^https?:\/\/([\w-]+\.)+[\w-]+.*$/,
      },
      err,
    )
  }

  /**
   * 校验日期时间 此方法校验部分类型会抛出异常，例如校验checkDatetime('aaa')
   *
   * @param {String} value 待校验的值
   * @param {BaseResponse} error 错误
   *
   * @returns {Object} this
   * @public
   */
  static checkTimestamp(value: number, error: BaseResponse) {
    if (value && moment(Number(value)).isValid()) {
      return this
    }
    throw error
  }

  /**
   * 校验是否是日期字符串
   *
   * @param {String} value 待校验的值 例：2016-01-01 (00:00:00)
   * @param {BaseResponse} error 错误
   *
   * @returns {Object} this
   * @public
   */
  static checkDate(value: string, error: BaseResponse) {
    if (dateFormatFullPattern.test(value) && !Number.isNaN(Date.parse(value))) {
      return this
    }
    throw error
  }

  /**
   * 检验数字
   *
   * @param {String|Number} value 待检验的值
   * @param {Object} opts 校验选项
   *  - {Number} min 最小值
   *  - {Number} max 最大值
   *  - {Number} precision 精度，小数点后最多几位小数
   * @param {BaseResponse} error 错误
   *
   * @returns {Object} this
   */
  static checkNumber(
    value: any,
    {
      min = Number.MIN_SAFE_INTEGER,
      max = Number.MAX_SAFE_INTEGER,
      step,
      precision,
    }: {
      min?: number
      max?: number
      step?: number
      precision?: number
    },
    error: BaseResponse,
  ) {
    let regex = '^(-?([1-9]\\d{0,20}|0))'
    if (precision) {
      regex += `(.\\d{1,${precision}})?$`
    } else {
      regex += '$'
    }
    if (!new RegExp(regex).test(value)) {
      throw error
    }
    const n = Number(value)
    if (n < Number(min) || n > Number(max)) {
      throw error
    }
    // 校验步长是否正确
    if (step && !new BigNumber(value).minus(min).dividedBy(step).isInteger()) {
      throw error
    }
    return this
  }

  /**
   * check address
   * @param value
   * @param error
   * @returns {*}
   */
  static checkAddress(value: string, error: BaseResponse) {
    return this.checkString(value, { regex: /^[0-9a-zA-Z-_]{42}$/ }, error)
  }

  /**
   * check wallet address
   * @param value
   * @param error
   * @returns {*}
   */
  static checkEtherAddress(value: string, error: BaseResponse) {
    if (Web3.utils.isAddress(value)) return this
    throw error
  }

  /**
   * check uuid
   * @param value
   * @param error
   * @returns {*}
   */
  static checkUuid(value: string, error: BaseResponse) {
    return this.checkString(value, { regex: UUID_REGEX }, error)
  }
}
