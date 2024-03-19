/**
 * @description checksum
 * @author yq
 * @date 2022-11-06 16:27
 */
import crypto from 'crypto'

interface IChecksum {
  checksum: string
  salt: string
}

export default class ChecksumUtil {
  /**
   * generate salt
   *
   * @param {Number} size the length of salt
   *
   * @returns {Promise<String>}
   */
  static generateSalt(size = 64) {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(size, (err, buf) => {
        if (err) {
          return reject(err)
        }
        return resolve(buf.toString('hex'))
      })
    })
  }

  /**
   * generate checksum by salt
   *
   * @param {String} plaintext
   * @param {String} salt checksum salt
   *
   * @returns {Promise<String>}
   */
  static generateChecksumBySalt(plaintext, salt) {
    return new Promise((resolve, reject) => {
      const iterations = 100000
      const keyLen = 64
      const digest = 'sha512'

      crypto.pbkdf2(plaintext, salt, iterations, keyLen, digest, (err, key) => {
        if (err) {
          return reject(err)
        }

        return resolve(key.toString('hex'))
      })
    })
  }

  /**
   * valid checksum
   *
   * @param plaintext
   * @param checksum
   * @param salt
   */
  static async validChecksum(plaintext, checksum, salt) {
    const newChecksum = await ChecksumUtil.generateChecksumBySalt(
      plaintext,
      salt,
    )
    return newChecksum === checksum
  }

  /**
   * generate checksum
   *
   * @param plaintext
   */
  static async generateChecksum(plaintext): Promise<IChecksum> {
    const salt = await ChecksumUtil.generateSalt(64)
    const checksum = await ChecksumUtil.generateChecksumBySalt(plaintext, salt)
    return {
      checksum,
      salt,
    } as IChecksum
  }

  /**
   * generate checksum by salt v2 version
   *
   * @param {String} plaintext
   * @param {String} salt checksum salt
   *
   * @returns {Promise<String>}
   */
  static generateChecksumBySaltV2(plaintext, salt) {
    return crypto
      .createHmac('sha256', salt)
      .update(plaintext, 'utf8')
      .digest('hex')
  }

  /**
   * valid checksum  v2 version
   *
   * @param plaintext
   * @param checksum
   * @param salt
   */
  static validChecksumV2(plaintext, checksum, salt) {
    const newChecksum = ChecksumUtil.generateChecksumBySaltV2(plaintext, salt)
    return newChecksum === checksum
  }

  /**
   * generate checksum v2 version
   *
   * @param plaintext
   */
  static async generateChecksumV2(plaintext): Promise<IChecksum> {
    const salt = await ChecksumUtil.generateSalt(64)
    const checksum = ChecksumUtil.generateChecksumBySaltV2(plaintext, salt)
    return {
      checksum,
      salt,
    } as IChecksum
  }
}
