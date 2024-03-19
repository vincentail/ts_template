/**
 * @description Logging Tools
 * @author yq
 * @date 2018/4/9 下午10:24
 */
import * as Log4js from 'log4js'
import { LOG4JS_CONFIG } from '../config/log/log4js.config'

Log4js.configure(LOG4JS_CONFIG)

const getLogger = Log4js.getLogger

export default getLogger
