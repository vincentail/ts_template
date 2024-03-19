/**
 * @description IP util
 * @author yq
 * @date 2022/10/30 4:53
 */
import os from 'os'

export class IpUtil {
  /**
   * get local ip
   * @return {String} ip address
   */
  static getLocalIp() {
    const interfaces: any = os.networkInterfaces()
    const keys = Object.keys(interfaces)
    console.log('full ip:', JSON.stringify(interfaces))
    for (let i = 0, keyLen = keys.length; i < keyLen; i += 1) {
      for (
        let j = 0, ifaceLen = interfaces[keys[i]].length;
        j < ifaceLen;
        j += 1
      ) {
        const alias = interfaces[keys[i]][j]
        if (
          alias.family === 'IPv4' &&
          alias.address !== '127.0.0.1' &&
          !alias.address.startsWith('169.254') && // exclude aws ips
          !alias.internal
        ) {
          return alias.address
        }
      }
    }
    return ''
  }
}
