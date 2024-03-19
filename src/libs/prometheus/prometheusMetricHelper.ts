import Config, { PROMETHEUS } from '../../config'
import PrometheusApiClient from './prometheusApiClient'

export default class PrometheusMetricHelper {
  /**
   * Returns node and region key value pairs
   */
  private static getDefaultLabels() {
    return [{ key: 'node', value: Config.appConfig.node }]
  }

}
