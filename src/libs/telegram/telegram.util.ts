import { Injectable } from '@nestjs/common'
import { Telegram } from 'telegraf'
import getLogger from '../../utils/logger'
import Config from '../../config'

const Logger = getLogger('TelegramUtil')

/**
 * when server restart we must compensate data. select the log table, if the
 * requests are un_confirmed, then add them to the memory and let the queue
 * service to deal
 */
@Injectable()
export default class TelegramUtil {
  telegram: Telegram
  constructor() {
    this.telegram = new Telegram(Config.telegram.token)
  }

  public async sendMessage(chatId: string, message: any) {
    Logger.info(`sendMessage to ${chatId} message: ${message}`)
    await this.telegram.sendMessage(chatId, message, { parse_mode: 'Markdown' })
  }
}
