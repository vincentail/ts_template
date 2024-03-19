/**
 * @description execute only once when request concurrently
 * @authors yq
 * @date 2022-10-12 14:33:54
 */
import events from 'events'
import getLogger from './logger'

const Logger = getLogger('ExecuteOnceUtil')

export class ExecuteOnceUtil {
  private readonly name: string
  private status: string
  private proxy: events.EventEmitter
  private static executorMap: any

  constructor(name: string) {
    this.name = name
    this.status = 'ready'
    this.proxy = new events.EventEmitter()
    this.proxy.setMaxListeners(0)
  }

  /**
   * getExecutor
   * @param name
   * @returns {ExecuteOnceUtil}
   */
  static getExecutor(name = 'executor') {
    ExecuteOnceUtil.executorMap = ExecuteOnceUtil.executorMap || {}
    if (!ExecuteOnceUtil.executorMap[name]) {
      ExecuteOnceUtil.executorMap[name] = new ExecuteOnceUtil(name)
    }
    return ExecuteOnceUtil.executorMap[name]
  }

  /**
   * execute
   * @param fn
   * @param params
   * @returns {Promise<unknown>}
   */
  execute(fn: any, ...params: any) {
    return new Promise((resolve, reject) => {
      this.proxy.once('executed', (err, result) => {
        if (err) return reject(err)
        return resolve(result)
      })
      if (this.status === 'ready') {
        this.status = 'pending'
        Logger.log(`execute ${this.name}`)
        fn(...params)
          .then((result: any) => {
            this.proxy.emit('executed', null, result)
            this.status = 'ready'
          })
          .catch((err: any) => {
            this.proxy.emit('executed', err)
            this.status = 'ready'
          })
      }
    })
  }
}
