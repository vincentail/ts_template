/**
 * @description lock util
 * @author yq
 * @date 2022/10/14 15:08
 */
import util from 'util'
import getLogger from './logger'
import { RedisConstant } from '../libs/redis/redisConstant'
import { RedisClient } from '../libs/redis/redisClient'
import { RedisEnum } from '../libs/redis/RedisEnum'

const Logger = getLogger('LockUtil')

export class LockUtil {
  private readonly validTime: number
  private readonly lockKey: string
  private isLocked: boolean
  private lockTime = Date.now()
  constructor(type: string, id: string, validTime = 120) {
    if (!type) {
      throw new Error('Invalid lock type')
    }
    if (!id) {
      throw new Error('Invalid lock id')
    }
    if (validTime <= 0) {
      throw new Error('Invalid lock valid time')
    }
    this.validTime = validTime
    this.lockKey = util.format(RedisConstant.lockKey, type, id)
    this.isLocked = false
  }

  /**
   * get lock key
   */
  public getLockKey() {
    return this.lockKey
  }

  /**
   * try get lock
   */
  async tryLock(): Promise<boolean> {
    this.lockTime = Date.now()
    const lock = await RedisClient.getInstance(RedisEnum.NODE).setNx(
      this.lockKey,
      1,
      this.validTime,
    )
    if (!lock) throw new Error('Failed to get lock')
    this.isLocked = true
    Logger.info(`get lock: ${this.lockKey}`)
    return true
  }

  /**
   * release lock
   */
  async unlock() {
    if (!this.isLocked || this.isExpired()) {
      Logger.info(
        `lock not acquired or the lock(${this.lockKey}) has been released after timeout`,
      )
      return
    }
    Logger.info(
      `release lock：${this.lockKey}, time: ${Date.now() - this.lockTime}`,
    )
    await RedisClient.getInstance(RedisEnum.NODE).del(this.lockKey)
  }

  /**
   * mutex
   * @param callback
   */
  async mutex(callback) {
    try {
      await this.tryLock()
      await callback()
    } finally {
      this.unlock().catch((e: any) => {
        Logger.error(`release lock error: ${e?.message}`, e)
      })
    }
  }

  /**
   * is expired
   */
  isExpired() {
    return Date.now() - this.lockTime >= this.validTime * 1000
  }
}
