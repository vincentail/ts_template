/**
 * @description update local config by remote config
 * @author yq
 * @date 2022/9/26 23:42
 */
import Config from '../../config'

export class ConfigHandlerService {
  /**
   * config handler
   * @param dynamicConfigs
   * @param keyMappings
   */
  static handler(dynamicConfigs, keyMappings) {
    keyMappings.forEach((item) => {
      // get remote value
      const remoteKeys = [...item.remoteKeys]
      let remoteValue
      while (remoteKeys.length) {
        const nowKey = remoteKeys.shift()
        if (!remoteValue) {
          remoteValue = dynamicConfigs[nowKey]
        } else {
          remoteValue = remoteValue[nowKey]
        }
        if (!remoteValue) break
      }
      if (!remoteValue) return
      // set local value
      const localKeys = [...item.localKeys]
      let config = Config
      while (localKeys.length > 1) {
        const nowKey = localKeys.shift()
        config[nowKey] = config[nowKey] || {}
        config = config[nowKey]
      }
      // 更新引用
      const originalValue = config[localKeys[0]]
      switch (typeof originalValue) {
        case 'number': {
          remoteValue = Number(remoteValue)
          break
        }
        case 'boolean': {
          remoteValue = remoteValue == 'true' || remoteValue === '1'
          break
        }
        case 'object': {
          remoteValue = JSON.parse(remoteValue)
          break
        }
        default:
      }
      config[localKeys[0]] = remoteValue
    })
  }
}
