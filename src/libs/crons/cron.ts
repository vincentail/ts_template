/**
 * @description cron logic
 * @author yq
 * @date 2018/6/21 11:51
 */
import moment from 'moment'
import * as schedule from 'node-schedule'
import Timer, { CRON_TYPES } from './timer'
import getLogger from '../../utils/logger'
import { CRON_JOBS, CronJob } from './cronJobs'
import { LockUtil } from '../../utils/lockUtil'
import { RedisClient } from '../redis/redisClient'
import { RedisEnum } from '../redis/RedisEnum'
import * as util from 'util'
import { RedisConstant } from '../redis/redisConstant'
import Config from '../../config'
import CommonUtil from '../../utils/commonUtil'

const Logger = getLogger('cron')

export default class Cron {
  private monitorTimer: NodeJS.Timeout | undefined
  cronMap: {
    [code: string]: CronJob
  }
  static instance: Cron

  constructor() {
    this.cronMap = {}
    for (const cronJob of CRON_JOBS) {
      this.cronMap[cronJob.code] = cronJob
    }
    // set monitor timer
    this.setMonitorTimer()
  }

  /**
   * lazy singleton pattern
   * @returns {Cron}
   */
  static getInstance(): Cron {
    if (!Cron.instance) {
      Cron.instance = new Cron()
    }
    return Cron.instance
  }

  /**
   * set master heartbeat timer
   */
  setMonitorTimer() {
    if (this.monitorTimer) {
      clearTimeout(this.monitorTimer)
    }
    this.monitorTimer = setTimeout(() => {
      this.setMonitorTimer()
      this.startMonitor().catch((e) => {
        Logger.error(`Monitor execution error: ${e?.message}`, e)
      })
    }, 5000)
  }

  async startMonitor() {
    Logger.info(`${Config.appConfig.node} job monitor start`)
    const time = Date.now()
    const crons = this.getCronJobs()
    for (const { code } of crons) {
      const cronJob: CronJob = await this.getCronJobByCode(code)
      // execution timeout or not executed
      if (
        cronJob.runningStatus === 1 &&
        cronJob.lastTime <= time - cronJob.timeout
      ) {
        Logger.warn(
          `【${cronJob.version}】execution timout, last time: ${moment(
            new Date(cronJob.lastTime),
          ).format('YYYY-MM-DD HH:mm:ss.SSS')}, current time: ${moment(
            new Date(time),
          ).format('YYYY-MM-DD HH:mm:ss.SSS')}`,
        )
        Cron.getInstance()
          .resetJob(code)
          .catch((e: any) =>
            Logger.error(`${cronJob.version} reset error: ${e?.message}`, e),
          )
      } else if (
        cronJob.runningStatus === 2 &&
        cronJob.nextTime < time - 10000
      ) {
        Logger.warn(
          `【${cronJob.version}】not executed, last time: ${moment(
            new Date(cronJob.nextTime),
          ).format('YYYY-MM-DD HH:mm:ss.SSS')}, current time: ${moment(
            new Date(time),
          ).format('YYYY-MM-DD HH:mm:ss.SSS')}`,
        )
        Cron.getInstance()
          .resetJob(code)
          .catch((e: any) =>
            Logger.error(`${cronJob.version} reset error: ${e?.message}`, e),
          )
      }
    }
    Logger.info(
      `${Config.appConfig.node} job monitor end, execution time: ${
        Date.now() - time
      }`,
    )
  }

  /**
   * get job by code
   * @param code
   * @returns {CronJob}
   */
  async getCronJobByCode(code): Promise<CronJob> {
    const cronJob = this.cronMap[code]
    const cache = await RedisClient.getInstance(RedisEnum.NODE).get(
      util.format(RedisConstant.cronKey, cronJob.code),
    )
    if (cache) {
      const cacheValue = JSON.parse(cache)
      Object.assign(cronJob, {
        lastTime: cacheValue.lastTime, // last execution time
        nextTime: cacheValue.nextTime, // next execution time
        executionTime: cacheValue.executionTime, // execution time
        runningStatus: cacheValue.runningStatus, // job running status: 0-init, 1-running, 2-end
        version: cacheValue.version, // job version, which is an uuid
      })
    }
    return cronJob
  }

  /**
   * get jobs
   * @returns {CronJob[]}
   */
  getCronJobs() {
    return CRON_JOBS
  }

  /**
   * save cron job to redis
   * @param cronJob
   */
  async updateCronJobCache(cronJob: CronJob) {
    // update job info
    await RedisClient.getInstance(RedisEnum.NODE).set(
      util.format(RedisConstant.cronKey, cronJob.code),
      JSON.stringify({
        ...cronJob,
        cronScript: undefined,
        scheduleJob: undefined,
      }),
    )
  }

  /**
   * get execution lock
   * @param cronJobInfo
   */
  async tryStart(cronJobInfo): Promise<boolean> {
    const { code, startTime, version, timeout } = cronJobInfo
    let validTime = Math.ceil(timeout / 1000)
    validTime = validTime < 600 ? validTime : 600
    // get job information
    const cronJob = await this.getCronJobByCode(code)
    // check job status
    if (cronJob.status !== 1) {
      Logger.warn(`${version} disabled`)
      return false
    }
    if (cronJob.runningStatus === 2 && cronJob.nextTime > Date.now()) {
      Logger.info(`${version} is executed by node ${cronJob.version}`)
      return false
    } else if (
      cronJob.runningStatus === 1 &&
      cronJob.lastTime > startTime - cronJob.timeout
    ) {
      Logger.warn(
        `${version} conflict, ${
          cronJob.version
        } is executing, start time:${moment(new Date(cronJob.lastTime)).format(
          'YYYY-MM-DD HH:mm:ss.SSS',
        )}, current time: ${moment(new Date(startTime)).format(
          'YYYY-MM-DD HH:mm:ss.SSS',
        )}`,
      )
      return false
    }
    if (cronJob.runningStatus === 1) {
      Logger.info(`${version} start, ${cronJob.version} timeout`)
    } else {
      Logger.info(`${version} start`)
    }
    await new LockUtil('cron', code, validTime).mutex(async () => {
      cronJob.runningStatus = 1
      cronJob.lastTime = startTime
      cronJob.version = version
      await this.updateCronJobCache(cronJob)
    })
    return true
  }

  /**
   * start job
   * @param cronJobInfo
   * @returns {Promise<boolean>}
   */
  async start(cronJobInfo): Promise<boolean> {
    const { code, startTime, version } = cronJobInfo
    try {
      // get execution lock
      const isLocked = await this.tryStart(cronJobInfo)
      if (!isLocked) return false
      // start job
      const { cronScript, method, timeout, params } = this.cronMap[code]
      await cronScript[method](...(params || []), { startTime, timeout })
    } catch (e: any) {
      if (e?.message === 'Failed to get lock') {
        // 未获取到执行锁
        Logger.warn(`${version} start error:${e.message}`)
        return false
      }
      Logger.error(`${version} execution error:${e?.message}`, e)
    }
    return true
  }

  /**
   * end job
   * @param cronJobInfo
   * @returns {Promise<void>}
   */
  async end(cronJobInfo) {
    const { code, startTime, version } = cronJobInfo
    try {
      const cronJob: CronJob = await this.getCronJobByCode(code)
      if (cronJob.runningStatus !== 1 || cronJob.version !== version) {
        Logger.error(
          `${version} has been replaced by: ${cronJob.version}, running status: ${cronJob.runningStatus}`,
        )
        return
      }
      cronJob.runningStatus = 2
      cronJob.executionTime = Date.now() - startTime
      cronJob.nextTime = this.cronMap[code].scheduleJob
        .nextInvocation()
        .getTime()
      await this.updateCronJobCache(cronJob)
      Logger.info(
        `${version} end，execution time：${
          cronJob.executionTime
        }, next time：${moment(new Date(cronJob.nextTime)).format(
          'YYYY-MM-DD HH:mm:ss.SSS',
        )}`,
      )
    } catch (e: any) {
      Logger.error(`${version} end error：${e?.message}`, e)
    }
  }

  /**
   * execute job
   * @param code
   * @returns {Promise<void>}
   */
  async execute(code) {
    const cronJobInfo = {
      code,
      startTime: Date.now(),
      version: `${this.cronMap[code].name}-${
        Config.appConfig.node
      }-${CommonUtil.getUuid()}`,
    }
    let isExecuted = true // whether the job is executed
    try {
      isExecuted = await this.start(cronJobInfo)
    } catch (e: any) {
      Logger.error(`${cronJobInfo.version} execution error：${e?.message}`, e)
    } finally {
      if (this.cronMap[code].type === CRON_TYPES.FIXED_DELAY) {
        // set the next execution time
        this.cronMap[code].scheduleJob.setNext(Date.now())
      }
    }
    if (isExecuted) {
      await this.end(cronJobInfo)
    }
  }

  /**
   * create cron job
   * @param code
   */
  createCronJob(code) {
    try {
      const cronJob = this.cronMap[code]
      if (cronJob.status !== 1) {
        Logger.warn(`${cronJob.name} disabled`)
        return
      }
      if (cronJob.scheduleJob) {
        cronJob.scheduleJob.cancel()
        Logger.info(`reset ${cronJob.name}`)
      } else {
        Logger.info(`create ${cronJob.name}`)
      }
      const startTime = Date.now() + (Number(cronJob.initialDelay) || 0)
      if (cronJob.type === CRON_TYPES.CRON) {
        if (!cronJob.cron) {
          Logger.error(`${cronJob.name} error: cron expression cannot be null`)
          return
        }
        cronJob.scheduleJob = schedule.scheduleJob(
          {
            start: startTime,
            rule: cronJob.cron,
          },
          () => this.execute(code),
        )
      } else if (cronJob.type === CRON_TYPES.FIXED_DELAY) {
        // fixed delay
        if (!cronJob.intervalTime) {
          Logger.error(`${cronJob.name} error: delay time cannot be null`)
          return
        }
        cronJob.scheduleJob = new Timer({
          type: CRON_TYPES.FIXED_DELAY,
          startTime,
          callback: this.execute.bind(this),
          params: [code],
          intervalTime: Number(cronJob.intervalTime),
        }).next()
      } else if (cronJob.type === CRON_TYPES.FIXED_RATE) {
        // fixed rate
        if (!cronJob.intervalTime || cronJob.intervalTime < 0) {
          Logger.error(`${cronJob.name} error: delay time cannot be null`)
          return
        }
        cronJob.scheduleJob = new Timer({
          type: CRON_TYPES.FIXED_RATE,
          startTime: Math.floor(startTime / 1000) * 1000,
          callback: this.execute.bind(this),
          params: [code],
          intervalTime: Number(cronJob.intervalTime),
        }).next()
      } else {
        Logger.error(`${cronJob.name} error: invalid cron type`)
      }
    } catch (e: any) {
      Logger.error(`${this.cronMap[code].name} error:`, e.stack || e)
    }
  }

  /**
   * reset job
   * @param code
   */
  async resetJob(code: string) {
    // del lock
    await RedisClient.getInstance(RedisEnum.NODE).del(
      new LockUtil('cron', code).getLockKey(),
    )
    const cronJob = await this.getCronJobByCode(code)
    cronJob.runningStatus = 0
    cronJob.nextTime = Date.now() + cronJob.intervalTime
    await this.updateCronJobCache(cronJob)
    this.createCronJob(code)
  }

  /**
   * Check for duplicate cronCode
   * @param crons
   */
  checkJob(crons) {
    if (!crons || crons.length == 0) {
      return false
    }

    const codeSets = new Set()
    for (const cron of crons) {
      if (codeSets.has(cron.code)) {
        throw new Error(
          `cron code cannot be duplicated, please check the cron definition, duplicate cron: {code: "${cron.code}", name: "${cron.name}", description: "${cron.description}"}`,
        )
      }

      codeSets.add(cron.code)
    }
  }

  /**
   * init all jobs
   * @returns {Promise<void>}
   */
  async startAll() {
    const crons = this.getCronJobs()
    this.checkJob(crons)
    for (const { code } of crons) {
      const cron = await this.getCronJobByCode(code)
      const cronScript = cron.cronScript
      if (typeof cronScript[cron.method] !== 'function') {
        const errorMsg = `${cron.name} error: invalid function name`
        Logger.error(errorMsg, cronScript)
        continue
      }
      this.cronMap[code] = { ...cron, cronScript }
      await this.resetJob(code)
    }
  }
}
