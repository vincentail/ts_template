/*
 * @description error messages
 * @authors yq
 * @date 2022-10-30 16:06:33
 */
import ErrorCode from './errorCode'

interface IErrorMsg {
  [propName: string]: {
    [propName: string]: string
  }
}

const ErrorMsg: IErrorMsg = {
  [ErrorCode.SUCCESS]: {
    cn: '成功',
    en: 'success',
    kr: '성공',
    jp: '成功',
  },
  [ErrorCode.FAILED]: {
    cn: '请求失败，请稍后重试',
    en: 'Request failed, please try again later',
    kr: '요청이 실패했습니다. 나중에 다시 시도하십시오.',
    jp: 'リクエストに失敗しました。後でやり直してください',
  },
  [ErrorCode.UNKNOWN_CUSTOM_ERROR]: {
    cn: '未知自定义错误',
    en: 'Unknown custom error',
  },
  [ErrorCode.CUSTOM_ERROR]: {
    cn: '请求参数错误',
    en: 'Incorrect request parameter',
  },
  [ErrorCode.SERVER_ERROR]: {
    cn: '系统错误',
    en: 'System error',
    kr: '시스템 오류',
    jp: 'システムエラー',
  },
  [ErrorCode.SYSTEM_MAINTENANCE]: {
    cn: '系统维护中，无法进行此操作',
    en: 'This operation cannot be performed during system maintenance',
  },
  [ErrorCode.UNKNOWN_ERROR]: {
    cn: '未知错误',
    en: 'Unknown error',
  },
  [ErrorCode.INVALID_PARAMS]: {
    cn: '请求参数错误',
    en: 'Incorrect request parameter',
    kr: '요청 매개 변수가 잘못되었습니다.',
    jp: 'リクエストパラメータが正しくありません',
  },
  [ErrorCode.TOKEN_EXPIRE]: {
    cn: '登录身份过期，请重新登录',
    en: 'Login expired, please log in again',
    kr: '로그인이 만료되었습니다. 다시 로그인하십시오.',
    jp: 'ログインが切れました。再度ログインしてください',
  },
  [ErrorCode.TOKEN_INVALID]: {
    cn: '无操作权限',
    en: 'No permission',
    kr: '조작 권한 없음',
    jp: '操作許可なし',
  },
  [ErrorCode.NOT_FOUND]: {
    cn: 'Not Found',
    en: 'Not Found',
  },
  [ErrorCode.FORCE_OFFLINE]: {
    cn: '您的账号在另一处登录，被迫下线',
    en: 'Your account is logged in at another place and you are forced to go offline',
  },
  [ErrorCode.PASSWORD_ERROR_TOO_MANY_TIMES]: {
    cn: '您密码输错次数太多，请重新登录',
    en: 'You have entered the wrong password too many times, please log in again',
  },
  [ErrorCode.FREQUENT_REQUEST]: {
    cn: '请求处理中...，请稍后',
    en: 'Incorrect request parameter',
    kr: '요청 처리 중 ... 기다려주십시오.',
    jp: 'リクエストの処理中...しばらくお待ちください',
  },
  [ErrorCode.REQUEST_TIMEOUT]: {
    cn: '请求超时',
    en: 'Request time out',
    kr: '요청 처리 중 ... 기다려주십시오.',
    jp: 'リクエストの処理中...しばらくお待ちください',
  },
  [ErrorCode.NO_AUTHORITY]: {
    cn: '无操作权限',
    en: 'No operation permission',
    kr: '조작 권한 없음',
    jp: '操作許可なし',
  },
  [ErrorCode.REQUEST_EXPIRED]: {
    cn: '请求已过期，请重试',
    en: 'Request has expired, please try again',
    kr: '요청이 만료되었습니다. 다시 시도하십시오.',
    jp: 'リクエストは期限切れです。もう一度お試しください',
  },
  [ErrorCode.INVALID_SIGNATURE]: {
    cn: '签名错误',
    en: 'Invalid signature',
    kr: '서명 오류가 발생했습니다. 다시 시도하십시오.',
    jp: '署名エラー、もう一度やり直してください',
  },
  [ErrorCode.EXPIRED_SIGNATURE]: {
    cn: '签名无效，请重试',
    en: 'Invalid signature, please try again',
    kr: '서명이 잘못되었습니다. 다시 시도하십시오.',
    jp: '署名が無効です。もう一度お試しください',
  },
  [ErrorCode.INVALID_TIMESTAMP]: {
    cn: '请求时间戳不能大于系统当前时间',
    en: 'Request timestamp cannot be greater than server current time',
  },
  [ErrorCode.INVALID_SALT]: {
    cn: '加密盐不正确',
    en: 'Invalid salt',
  },
  [ErrorCode.INVALID_RECV_WINDOW]: {
    cn: 'recvWindow必须为不大于60000的正整数',
    en: 'Invalid recvWindow, which must be an integer between 1 and 60000',
  },
  [ErrorCode.INVALID_START_TIME]: {
    cn: '开始时间不正确',
    en: 'invalid start time',
  },
  [ErrorCode.INVALID_END_TIME]: {
    cn: '结束时间不正确',
    en: 'invalid end time',
  },
  [ErrorCode.INVALID_TIME_RANGE]: {
    cn: '时间区间过大',
    // 时间区间超过最大限制
    en: 'Time range too large',
  },
  // invalid limit
  [ErrorCode.INVALID_LIMIT]: {
    cn: 'limit不正确或过大',
    en: 'Invalid limit or limit to large',
  },
  // invalid offset
  [ErrorCode.INVALID_OFFSET]: {
    cn: 'offset不正确',
    en: 'Invalid offset',
  },
  [ErrorCode.UNKNOWN]: {
    cn: '未知错误',
    en: 'Unknown error',
  },
  [ErrorCode.TRANSACTION_FAILED]: {
    cn: '上链失败',
    en: 'Transaction submit failed',
  },
  [ErrorCode.INVALID_ORDER]: {
    cn: '订单信息有误',
    en: 'Invalid order',
  },
  [ErrorCode.INSUFFICIENT_BALANCE]: {
    cn: '余额不足',
    en: 'Insufficient balance',
  },
  [ErrorCode.SIGNATURE_FAILED]: {
    cn: '签名失败',
    en: 'Transaction signature failed',
  },
  [ErrorCode.INSUFFICIENT_PAYMENT_AMOUNT]: {
    cn: 'Gas 费用过高，支付金额不足',
    en: 'Gas fee too high, insufficient payment amount',
  },
  [ErrorCode.ORDER_EXPIRED]: {
    cn: '订单失效',
    en: 'Order expired',
  },
  [ErrorCode.ORDER_FULFILLED]: {
    cn: '该订单已成交',
    en: 'Order has been filled',
  },
  [ErrorCode.INVALID_CHECKSUM]: {
    cn: '校验信息不正确',
    en: 'Invalid checksum',
  },
  [ErrorCode.INVALID_ADDRESS]: {
    cn: '地址不正确',
    en: 'Invalid address',
  },
  [ErrorCode.INVALID_TOKEN_ADDRESS]: {
    cn: 'Token地址不正确',
    en: 'Invalid token address',
  },
  [ErrorCode.INVALID_TOKEN_ID]: {
    cn: 'Token ID不正确',
    en: 'Invalid token id',
  },
  [ErrorCode.INVALID_EXPIRATION_TIME]: {
    cn: '过期时间不正确',
    en: 'Invalid expiration time',
  },
  [ErrorCode.INVALID_LISTING_TIME]: {
    cn: '上架时间不正确',
    en: 'Invalid listing time',
  },
  [ErrorCode.INVALID_START_AMOUNT]: {
    cn: '订单最低金额不正确',
    en: 'Invalid start amount',
  },
  [ErrorCode.INVALID_CHAIN]: {
    cn: 'chain不正确',
    en: 'Invalid chain',
  },
  [ErrorCode.INVALID_MARKETPLACE]: {
    cn: '市场不正确',
    en: 'Invalid marketplace',
  },
  [ErrorCode.ALREADY_CHECKED_IN]: {
    cn: '今日已签到',
    en: 'Already checked in today',
  },
  [ErrorCode.NOT_STARTED]: {
    cn: '活动未开始',
    en: 'Activity not started',
  },
}

export type ErrorMsgType = keyof typeof ErrorMsg

export default ErrorMsg
