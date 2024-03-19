/**
 * @description log config
 * @author yq
 * @date 2022/6/27 18:56
 */
import { Configuration } from 'log4js'

const isDev = !process.env.NODE_ENV || process.env.NODE_ENV === 'development'
const LAYOUT_TYPE = isDev ? 'colored' : 'basic'

export const LOG4JS_CONFIG: Configuration = {
  appenders: {
    console: {
      type: 'console',
      layout: {
        type: LAYOUT_TYPE,
      },
    },
    app: {
      type: 'file',
      filename: './logs/app.log',
      maxLogSize: 50 * 1024 * 1024,
      layout: {
        type: LAYOUT_TYPE,
      },
      backups: 5,
    },
    error: {
      type: 'file',
      filename: './logs/error.log',
      maxLogSize: 50 * 1024 * 1024,
      layout: {
        type: LAYOUT_TYPE,
      },
      backups: 5,
    },
    monitor: {
      type: 'file',
      filename: './logs/monitor.log',
      // 50M 单文件大小，单位字节
      maxLogSize: 50 * 1024 * 1024,
      layout: {
        type: LAYOUT_TYPE,
      },
      backups: 5,
    },
  },
  categories: {
    default: { appenders: ['console', 'app'], level: 'info' },
    error: {
      appenders: ['console', 'app', 'monitor', 'error'],
      level: 'debug',
    },
    monitor: { appenders: ['console', 'monitor'], level: 'info' },
  },
  pm2: true,
  disableClustering: true,
}
