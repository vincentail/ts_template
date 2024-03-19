
import express from 'express'
import bodyParser from 'body-parser'
import client, { GaugeConfiguration } from 'prom-client'
import PrometheusClient from './prometheusClient'
import config from '../../config'

import getLogger from '../../utils/logger'

const logger = getLogger('PrometheusServer')

interface Metric {
  label: Array<{ key: string; value: string }>
  value: string // count or other value
  name: string // metric name
}

class PrometheusServer {
  private client: PrometheusClient

  constructor() {
    logger.info('create new prometheusServer')
    this.client = new PrometheusClient()
    this.init()
  }

  /**
   * Initialize with metric configs
   * @private
   */
  private init() {
    logger.info('init gauge')
    const metricConfigs: Array<GaugeConfiguration<string>> =
      config?.promServerConfig?.metricConfig

    logger.info('Load promServerConfig metricConfig: ', metricConfigs)
    if (!metricConfigs) {
      throw new Error('Missing metricConfig configuration item')
    }

    metricConfigs.forEach((config: GaugeConfiguration<string>) => {
      this.client.addGauge(config)
      logger.info(`${config.name} init-gauge complete!`)
    })
  }

  /**
   * Start prometheus server
   */
  public async start() {
    // Create sever instance
    const server = express()
    this.middleware(server)
    // append routes
    await this.route(server)
    // set port and start to listen
    const port = process.env.PROMETHEUS_SERVICE_PORT || 28081
    logger.info(
      `Server listening to ${port}, metrics exposed on /metrics endpoint`,
    )
    server.listen(port)
  }

  /**
   * Set middleware to parse JSON
   * @param server
   * @private
   */
  private middleware(server: any) {
    server.use(
      bodyParser.urlencoded({
        extended: true,
      }),
    )
    server.use(bodyParser.json())
  }

  /**
   *
   * @param server
   * @private
   */
  private async route(server: any) {
    server.get('/prometheus', await this.metrics.bind(this))
    server.post('/metrics', await this.addMetrics.bind(this))
    server.get('/health', this.health.bind(this))
  }

  /**
   * Handler of the path POST /metrics
   * @param req
   * @param res
   * @private
   */
  private async addMetrics(req, res) {
    const bodyData = req.body as Metric
    const metrics = bodyData['metrics'] as Metric[]
    if (!metrics || Array.isArray(metrics)) {
      metrics.forEach((metric) => {
        const gauge = this.client.getGauge(metric.name)
        if (gauge) {
          const label = {}
          metric.label.forEach((item) => {
            label[item.key] = item.value
          })
          try {
            gauge.set(label, Number(metric.value))
          } catch (e) {
            logger.error('Failed set gauge: ', e)
          }
        } else {
          logger.error(`Metric with name ${metric.name} is not exists`)
        }
      })
      // all added, ignore failed gauge data
      res.status(200).json({
        result: true,
        message: 'Metrics are set successfully',
      })
    } else {
      res.status(400).json({
        result: false,
        message: 'The field `metrics` is missing.',
      })
    }
  }

  /**
   * Handler of the path GET /prometheus
   * @param req
   * @param res
   * @private
   */
  private async metrics(req, res) {
    try {
      res.set('Content-Type', client.contentType)
      res.end(await this.client.register?.metrics())
    } catch (ex) {
      res.status(500).end(ex)
    }
  }

  /**
   * Handler of the path GET /health
   * @param req
   * @param res
   * @private
   */
  private health(req, res) {
    res.status(200).json({
      result: true,
      message: 'OK',
    })
  }
}

export default PrometheusServer
