/**
 * @description Prometheus Api client
 * @author Lawson Cheng
 * @date 2022/08/20
 */
import axios from 'axios'
import getLogger from '../../utils/logger'
import config from '../../config'

const logger = getLogger('Prometheus Api Client')

interface Label {
  key: string
  value: string | number
}

interface Metric {
  name: string
  label: Label[]
  value: string | number
}

interface AsyncMetricTask {
  task: any
  params: any[]
}

export default class PrometheusApiClient {
  private static _metrics: Metric[] = []
  private static _awaitMetrics: AsyncMetricTask[] = []
  private static maxQueue = 100000

  /**
   * Send metric to server
   * @private
   * @param metrics
   */
  private static async sendMetric(metrics: Metric[]) {
    return axios({
      url: `${config.promServerConfig.endpoint}/metrics`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      timeout: 30000,
      data: JSON.stringify({ metrics }),
    })
  }

  /**
   * Process metrics every 0.25s
   */
  private static async processMetricsQueue() {
    try {
      if (PrometheusApiClient._metrics.length) {
        // batch send
        await PrometheusApiClient.sendMetric(PrometheusApiClient._metrics)
        // clear array
        PrometheusApiClient._metrics = []
        logger.debug('Metrics are sent to the prometheus successfully')
      }
    } catch (e: any) {
      logger.error(`Failed to send to prometheus server: ${e?.message}`, e)
    }
  }

  /**
   * Process async metric tasks
   * function must be async in order to process
   */
  private static async processAsyncMetricsQueue() {
    try {
      if (PrometheusApiClient._awaitMetrics.length) {
        // pop function
        const asyncMetricFunction = PrometheusApiClient._awaitMetrics.shift()
        if (asyncMetricFunction?.task?.constructor?.name === 'AsyncFunction') {
          await asyncMetricFunction.task(...(asyncMetricFunction.params || []))
        }
      }
    } catch (e: any) {
      logger.error(`Failed to execute async metrics task: ${e?.message}`, e)
    }
  }

  /**
   * Start to run prometheus task processing loop
   */
  public static async processTaskQueue() {
    await PrometheusApiClient.processMetricsQueue()
    await PrometheusApiClient.processAsyncMetricsQueue()
  }

  /**
   * Push metric to the queue and waiting for send out
   * @param metric
   */
  static queueMessage(metric: Metric) {
    PrometheusApiClient._metrics.push(metric)
    while (PrometheusApiClient._metrics.length > PrometheusApiClient.maxQueue) {
      PrometheusApiClient._metrics.shift()
    }
  }

  /**
   * Push async metric task to the queue
   * @param task
   */
  static queueAsyncMetricTask(task: AsyncMetricTask) {
    PrometheusApiClient._awaitMetrics.push(task)
    while (
      PrometheusApiClient._awaitMetrics.length > PrometheusApiClient.maxQueue
    ) {
      PrometheusApiClient._awaitMetrics.shift()
    }
  }
}
