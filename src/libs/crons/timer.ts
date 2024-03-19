/**
 * @description timer
 * @author yq
 * @date 2018/11/15 3:08 PM
 */
import { getLogger } from 'log4js'
const Logger = getLogger('timer')

export enum CRON_TYPES {
  CRON = 1, // execution job by cron expression
  FIXED_DELAY = 2, // fixed delay time to execute job after the last job ends
  FIXED_RATE = 3, // fixed frequency time to execute job
}

export default class Timer {
  type: CRON_TYPES
  timer: any
  intervalTime: number
  startTime: number
  nextTime: number
  lastTime: number
  callback: any
  params: any

  constructor({ type = 1, intervalTime, startTime = 0, callback, params }) {
    if (!intervalTime) throw new Error('fixed delay time cannot be null')
    if (typeof callback !== 'function') {
      throw new Error('the callback must be a function')
    }
    this.type = type
    this.timer = null
    this.intervalTime = intervalTime
    this.startTime = startTime || Date.now()
    this.nextTime = this.startTime
    this.lastTime = 0
    this.callback = callback
    this.params = params
  }

  /**
   * cancel timer
   */
  cancel() {
    if (this.timer) clearTimeout(this.timer)
  }

  /**
   * get next timer time
   * @returns {Date}
   */
  nextInvocation() {
    return new Date(this.nextTime)
  }

  next() {
    this.cancel()
    this.nextTime =
      this.nextTime >= this.startTime
        ? this.nextTime
        : this.startTime + this.intervalTime
    this.timer = setTimeout(() => {
      this.lastTime = Date.now()
      // only support promise
      try {
        if (this.type === CRON_TYPES.FIXED_DELAY) {
          this.callback(...this.params).catch((err) =>
            Logger.error(`job execution error：${err?.message}`, err),
          )
        } else if (this.type === CRON_TYPES.FIXED_RATE) {
          this.setNext(this.nextTime)
          this.callback(...this.params).catch((err) =>
            Logger.error(`job execution error：${err?.message}`, err),
          )
        }
      } catch (e: any) {
        Logger.error(`job execution error：${e?.message}, ${this.params}`, e)
        this.setNext(this.nextTime)
      }
    }, this.nextTime - Date.now())
    return this
  }

  /**
   * set next job for fixed delay job
   */
  setNext(lastTime: number) {
    if (this.type === CRON_TYPES.FIXED_DELAY) {
      if (this.intervalTime < 0) {
        return
      }
    }
    this.nextTime = (lastTime || Date.now()) + this.intervalTime
    this.next()
  }
}
