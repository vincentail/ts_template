/**
 * @description master job
 * @author yq
 * @date 2018/6/21 11:49
 */
import { getLogger } from 'log4js'
import { RedisClient } from '../redis/redisClient'
import { RedisConstant } from '../redis/redisConstant'
import Config from '../../config'

const Logger = getLogger('master')

export default class Master {
  private heartbeatTimer: NodeJS.Timeout | undefined
  private static instance: Master
  public isMaster = true

  constructor() {
    this.setHeartbeatTimer()
  }

  /**
   * lazy singleton pattern
   */
  public static getInstance() {
    if (!Master.instance) {
      Master.instance = new Master()
    }
    return Master.instance
  }

  /**
   * master heartbeat
   */
  async heartbeat() {
    const currentNode = Config.appConfig.node
    const node = await RedisClient.getInstance().get(
      RedisConstant.masterNodeKey,
    )
    Logger.info(
      `Node heartbeat, master: ${node || ''}, current: ${currentNode}`,
    )
    this.isMaster = node === currentNode || !node
    if (this.isMaster) {
      // heartbeat
      if (node) {
        await RedisClient.getInstance().expire(RedisConstant.masterNodeKey, 10)
      } else {
        await RedisClient.getInstance().setNx(
          RedisConstant.masterNodeKey,
          currentNode,
          10,
        )
      }
    }
  }

  /**
   * set master heartbeat timer
   */
  setHeartbeatTimer() {
    if (this.heartbeatTimer) {
      clearTimeout(this.heartbeatTimer)
    }
    this.heartbeatTimer = setTimeout(() => {
      this.setHeartbeatTimer()
      this.heartbeat().catch((e) => {
        Logger.error(`Node heartbeat error: ${e?.message}`, e)
      })
    }, 5000)
  }
}
