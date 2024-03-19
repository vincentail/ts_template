import { HttpUtil } from '../../utils/httpUtil'
import Promise from 'bluebird'
import fs from 'fs'
import path from 'path'
import getLogger from '../../utils/logger'
import { IpUtil } from '../../utils/ipUtil'

const Logger = getLogger('apollo')

export default class Apollo {
  private readonly isPoll = true
  private readonly timeoutMs = 70000
  private onPolling: any
  private apolloConfig: { [key: string]: any }
  private readonly configServerUrl: string
  private readonly appId: string
  private readonly clusterName = 'cluster'
  private readonly namespaces = ['application']
  private readonly configPath = `${process.cwd()}/config/apolloConfig.json`
  private readonly notifications = {}
  private clientIp = ''

  constructor({
    configServerUrl,
    appId,
    namespaces = ['application'],
    clusterName = 'cluster',
    configPath = `${process.cwd()}/config/apolloConfig.json`,
    timeoutMs = 70000,
    onChange,
  }: any) {
    if (!configServerUrl) {
      throw new Error('configServerUrl can not be empty')
    }

    this.isPoll = true

    // 初始化超时
    this.timeoutMs = timeoutMs
    // 有配置更新回调
    this.onPolling = onChange
    this.apolloConfig = {}
    this.configServerUrl = configServerUrl
    this.appId = appId
    this.clusterName = clusterName
    this.namespaces = namespaces
    this.configPath = configPath
    this.notifications = {}
    this.namespaces.forEach((item) => {
      this.notifications[item] = -1
    })
  }

  async polling() {
    let pollingCount = 1

    while (this.isPoll) {
      Logger.info(`polling count: ${pollingCount++}`)
      try {
        await this.pollingNotification()
      } catch (error) {
        Logger.error('polling error:', error)
        await Promise.delay(1000)
      }
    }
  }

  // 根据namespace拉取配置文件
  async fetchConfigFromApolloByNamespace(namespace) {
    const config = this.getConfigs()
    const releaseKey =
      (config && config[namespace] && config[namespace].releaseKey) || ''
    const url = `/configs/${this.appId}/${this.clusterName}/${namespace}?ip=${
      this.clientIp
    }${releaseKey ? `&releaseKey=${releaseKey}` : ''}`
    try {
      const startTime = Date.now()
      const { body, response } = await HttpUtil.send({
        baseURL: this.configServerUrl,
        method: 'GET',
        url,
        timeout: this.timeoutMs,
      })
      if (response.statusCode === 200) {
        config[namespace] = body
        this.saveConfigsToFile(config)
      }
      Logger.info(
        `fetchConfigFromApolloByNamespace finished, statusCode: ${
          response.statusCode
        }, execution time: ${Date.now() - startTime}, url: ${
          this.configServerUrl
        }${url}`,
      )
    } catch (error: any) {
      Logger.error(
        'fetchConfigFromApolloByNamespace error:',
        error.message,
        url,
        error,
      )
    }
  }

  // 拉取全量配置
  async fetchConfigFromApollo() {
    for (const namespace of this.namespaces) {
      await this.fetchConfigFromApolloByNamespace(namespace)
    }
  }

  // 监控配置文件变更
  async pollingNotification() {
    const startTime = Date.now()
    const notifications = JSON.stringify(
      Object.keys(this.notifications).map((namespace) => {
        return {
          namespaceName: namespace,
          notificationId: this.notifications[namespace],
        }
      }),
    )

    const notificationsEncode = encodeURIComponent(notifications)
    const url = `/notifications/v2?appId=${this.appId}&cluster=${this.clusterName}&notifications=${notificationsEncode}`

    const { body, response } = await HttpUtil.send({
      baseURL: this.configServerUrl,
      method: 'GET',
      url,
      timeout: this.timeoutMs,
    })
    Logger.info(
      `pollingNotification finished, statusCode: ${
        response.statusCode
      }, execution time: ${Date.now() - startTime}, url: ${
        this.configServerUrl
      }${url}`,
    )
    if (response.statusCode === 200) {
      for (const item of body) {
        await this.fetchConfigFromApolloByNamespace(item.namespaceName)
        this.notifications[item.namespaceName] = item.notificationId
      }
    }
  }

  // 写入配置文件到磁盘
  saveConfigsToFile(configObj) {
    const configPath = this.configPath
    const dirStr = path.dirname(configPath)

    if (!fs.existsSync(dirStr)) {
      fs.mkdirSync(dirStr, { recursive: true })
    }

    // 把点属性的key嵌套为对象
    this.apolloConfig = configObj
    this.onPolling && this.onPolling(configObj)
    // 使用同步的方式，必备异步写文件冲突
    fs.writeFileSync(configPath, JSON.stringify(configObj))
    Logger.info('Local apollo config file changed')
  }

  // 读取本地配置文件
  readConfigsFromFile() {
    const configPath = this.configPath
    if (!fs.existsSync(configPath)) {
      return {}
    }
    const fileBuf = fs.readFileSync(configPath)

    if (fileBuf.length <= 0) {
      throw new Error('Invalid local apollo config file')
    }
    const configStr = fileBuf.toString()
    return JSON.parse(configStr)
  }

  // 拉取所有配置到本地
  async init() {
    try {
      this.clientIp = IpUtil.getLocalIp()
      await this.fetchConfigFromApollo()
    } catch (error: any) {
      // 初始化失败，恢复本地配置文件
      Logger.error(`get config from apollo error: ${error?.message}`, error)
      this.apolloConfig = this.readConfigsFromFile()
    } finally {
      this.polling().catch(Logger.error)
    }
  }

  getConfigs() {
    return this.apolloConfig
  }

  onChange(cb) {
    this.onPolling = cb
  }
}
