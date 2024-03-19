/**
 * @description grayscale util
 * @author yq
 * @date 2022/11/10 10:41
 */
import Config from '../config'

export default class GrayscaleUtil {
  static uidsSet: Set<string>

  /**
   * whether hit the grayscale
   * @param uid
   */
  public static isHit(uid: string) {
    if (!GrayscaleUtil.uidsSet) {
      GrayscaleUtil.uidsSet = new Set<string>(Config.grayscaleConfig.uids)
    }
    return (
      Number(uid) % 100 > Config.grayscaleConfig.ratio ||
      GrayscaleUtil.uidsSet.has(uid)
    )
  }
}
