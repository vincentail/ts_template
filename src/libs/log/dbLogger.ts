/**
 * @description
 * @author yq
 * @date 2022/10/29 15:10
 */
import { Logger } from 'typeorm'
import getLogger from '../../utils/logger'
import Config from '../../config'

const mysqlLogger = getLogger('sql')

export class DbLogger implements Logger {
  logQuery(query: string, parameters?: any[]) {
    if (Config.appConfig.sqlLog) {
      mysqlLogger.info(query, parameters || '')
    }
  }

  logQueryError(error: string, query: string, parameters?: any[]) {
    if (Config.appConfig.sqlLog) {
      mysqlLogger.error(query, parameters || '', error)
    }
  }

  logQuerySlow(time: number, query: string, parameters?: any[]) {
    if (Config.appConfig.sqlLog) {
      mysqlLogger.info(query, parameters || '', `execution time: ${time}`)
    }
  }

  logSchemaBuild(message: string) {
    if (Config.appConfig.sqlLog) {
      mysqlLogger.info(message)
    }
  }

  logMigration(message: string) {
    if (Config.appConfig.sqlLog) {
      mysqlLogger.info(message)
    }
  }

  log(level: 'log' | 'info' | 'warn', message: any) {
    if (Config.appConfig.sqlLog) {
      switch (level) {
        case 'info': {
          mysqlLogger.info(message)
          break
        }
        case 'warn': {
          mysqlLogger.warn(message)
        }
      }
    }
  }
}
