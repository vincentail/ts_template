/**
 * @description error code
 * @authors yq
 * @date 2022-10-30 16:06:19
 */

export const enum ErrorCode {
  // common errors
  SUCCESS = '000000000', // 成功
  FAILED = '1', // 失败
  UNKNOWN_CUSTOM_ERROR = '-2', // 自定义未知错误, 错误信息需要设定
  CUSTOM_ERROR = '-1', // 自定义错误, 错误信息需要设定
  SERVER_ERROR = '500', // 系统错误
  SYSTEM_MAINTENANCE = '503', // 系统维护中，无法进行此操作
  UNKNOWN_ERROR = '505', // 未知错误
  INVALID_PARAMS = '400', // 请求参数错误
  TOKEN_EXPIRE = '401', // token过期
  TOKEN_INVALID = '403', // token不正确或权限不足
  NOT_FOUND = '404', // not found
  FORCE_OFFLINE = '460', // 被挤下线
  PASSWORD_ERROR_TOO_MANY_TIMES = '461', // 密码输错太多次，请重新登录
  FREQUENT_REQUEST = '1001', // 请求处理中...，请稍后
  REQUEST_TIMEOUT = '1002', // 请求超时
  NO_AUTHORITY = '1003', // 无操作权限
  REQUEST_EXPIRED = '1004', // 请求过期
  INVALID_SIGNATURE = '1005', // 签名不正确
  EXPIRED_SIGNATURE = '1006', // 该签名已失效
  INVALID_TIMESTAMP = '1007', // 请求时间戳不能大于系统当前时间
  INVALID_SALT = '1008', // invalid salt
  INVALID_RECV_WINDOW = '1009', // invalid recv window
  // invalid start time
  INVALID_START_TIME = '1010',
  // invalid end time
  INVALID_END_TIME = '1011',
  // invalid time range
  INVALID_TIME_RANGE = '1012',
  // invalid limit
  INVALID_LIMIT = '1013',
  // invalid offset
  INVALID_OFFSET = '1014',
  UNKNOWN = '103469000',
  TRANSACTION_FAILED = '103469001',
  INVALID_ORDER = '103469002',
  INSUFFICIENT_BALANCE = '103469003',
  SIGNATURE_FAILED = '103469004',
  INSUFFICIENT_PAYMENT_AMOUNT = '103469005',
  ORDER_EXPIRED = '103469006',
  ORDER_FULFILLED = '103469007',
  INVALID_CHECKSUM = '103469008',
  INVALID_ADDRESS = '103469100',
  INVALID_TOKEN_ADDRESS = '103469101',
  INVALID_TOKEN_ID = '103469102',
  INVALID_EXPIRATION_TIME = '103469103',
  INVALID_START_AMOUNT = '103469104',
  INVALID_CHAIN = '103469105',
  INVALID_MARKETPLACE = '103469106',
  INVALID_LISTING_TIME = '103469107',
  ALREADY_CHECKED_IN = '10000',
  NOT_STARTED = '10001',
}

export default ErrorCode
