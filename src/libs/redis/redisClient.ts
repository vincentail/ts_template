/**
 * @description redis client
 * @author yq
 * @date 2022/10/14 12:29
 */
import IORedis, { Cluster, Redis } from 'ioredis'
import getLogger from '../../utils/logger'
import Config from '../../config'
import { RedisEnum } from './RedisEnum'

const Logger = getLogger('redis-client')
export class RedisClient {
  private static instances: { [kyc: string]: RedisClient }
  private readonly client: Redis | Cluster
  private mode: string

  constructor(name: RedisEnum) {
    const redisConfig: any = Config.redisConfig[name]
    // use exchange redis when not config
    if (!redisConfig || !redisConfig.host) {
      throw new Error('Invalid redis configuration')
    }
    this.mode = redisConfig.mode
    this.client = this.create({
      ...redisConfig,
      // redis key prefix
      keyPrefix: redisConfig.prefix,
    })
  }

  /**
   * create redis client
   * @param options
   */
  create(options): Redis | Cluster {
    if (options.mode === 'cluster') {
      return this.createCluster(options)
    }
    return this.createSingle(options)
  }

  /**
   * redis client event
   * @param client
   * @private
   */
  private onClientEvent(client: Redis | Cluster) {
    // error event
    client.on('error', (e) => {
      Logger.error(`redis connect error: ${e && e.message}`, e)
    })

    // reconnect when disconnected
    client.on('reconnecting', () => {
      Logger.warn('redis reconnecting')
    })
  }

  /**
   * create single redis client
   * @param options
   */
  createSingle(options): Redis {
    Logger.info('create redis single client......')
    const client = new IORedis(options)
    this.onClientEvent(client)
    return client
  }

  /**
   * create redis cluster client
   * @param options
   */
  createCluster(options): Cluster {
    Logger.info('create redis cluster client......')
    // only support aws cluster
    const client = new IORedis.Cluster([options], {
      keyPrefix: options.keyPrefix,
    })
    this.onClientEvent(client)
    return client
  }

  /**
   * 懒汉单例模式
   * @returns {RedisClient}
   */
  static getInstance(name = RedisEnum.NODE) {
    if (!RedisClient.instances) {
      RedisClient.instances = {}
      Object.values(RedisEnum).forEach((key) => {
        RedisClient.instances[key] = new RedisClient(key)
      })
    }
    return RedisClient.instances[name]
  }

  public async getClient() {
    return this.client
  }

  /**
   * get by key
   * @param key
   */
  async get(key: string) {
    return this.client.get(key)
  }

  /**
   * set value
   * @param key
   * @param value
   * @param seconds
   */
  async set(key: string, value: any, seconds?: number) {
    if (!seconds) {
      return this.client.set(key, value)
    }
    return this.client.set(key, value, 'EX', seconds)
  }

  /**
   * set the value when key does not exist
   * @param key
   * @param value
   * @param expire
   */
  setNx(key, value, expire) {
    return this.client.set(key, value, 'EX', expire, 'NX')
  }

  /**
   * delete key
   * @param key
   */
  async del(key) {
    return this.client.del(key)
  }

  /**
   * expire the key
   * @param key
   * @param expire
   */
  expire(key, expire) {
    return this.client.expire(key, expire)
  }
}
