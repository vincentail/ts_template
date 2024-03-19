
import PrometheusServer from './prometheusServer'
import getLogger from '../../utils/logger'

const logger = getLogger('PrometheusServer start')

const start = () => {
  new PrometheusServer()
    .start()
    .then(() => {
      logger.info('Prometheus start complete!')
    })
    .catch(() => {
      logger.error('Prometheus start failed!')
    })
}

start()
