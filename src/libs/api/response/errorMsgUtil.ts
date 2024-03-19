/**
 * @description error msg util
 * @author yq
 * @date 2022/11/1 12:37
 */
import ErrorMsg from './errorMsg'

export default class ErrorMsgUtil {
  public static readonly defaultLanguage: string = 'en'

  /**
   * get error message
   * @param code
   * @param language
   */
  public static getMsg(code, language = ErrorMsgUtil.defaultLanguage) {
    return (
      (ErrorMsg[code] &&
        (ErrorMsg[code][language] ||
          ErrorMsg[code][ErrorMsgUtil.defaultLanguage])) ||
      'Unknown'
    )
  }
}
