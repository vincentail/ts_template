
import client, {
  Gauge,
  GaugeConfiguration,
  Histogram,
  HistogramConfiguration,
  MetricConfiguration,
  Registry,
} from 'prom-client'
import getLogger from '../../utils/logger'

const logger = getLogger('PrometheusClient')

// NOTE: The following custom classes are added, inherited from third-party libraries,
// for the purpose of subsequent customization of the relevant data, or to perform relevant
// checks on the data

/**
 * Explanation of config: XXXConfiguration
 *
 * 1、name: This field is the unique name of each chart on the page
 * 2、help: You can fill in the description information of the current chart
 * 3、labelNames: The different categories of data on the icon can be thought
 * of as the key being the category name and the value being the corresponding
 * subcategory, e.g. Key: symbol, value: USDT
 * 4、registers: After testing, will automatically create the default value,
 * the generated information, if a time to generate the contents of multiple charts,
 * here you need to create different names to generate multiple different registers,
 * the same name can only and is recommended to generate only a chart
 */
class CustomGauge<T extends string> extends Gauge<T> {
  constructor(config: GaugeConfiguration<T>) {
    super(config)
  }
}

class CustomHistogram<T extends string> extends Histogram<T> {
  constructor(config: HistogramConfiguration<T>) {
    super(config)
  }
}

class PrometheusClient {
  private _gaugeMap?: Map<string, CustomGauge<string>> = new Map<
    string,
    CustomGauge<string>
  >()
  private _histogram?: Map<string, CustomHistogram<string>>

  public addGauge(config: GaugeConfiguration<string>) {
    this.checkConfig(config)

    logger.debug('addGauge', JSON.stringify(config))
    this._gaugeMap?.set(config.name, new CustomGauge<string>(config))
  }

  public addHistogram(config: HistogramConfiguration<string>) {
    this.checkConfig(config)

    logger.debug('initHistogram', JSON.stringify(config))
    this._histogram?.set(config.name, new CustomHistogram(config))
  }

  public getGauge(name: string): CustomGauge<string> | undefined {
    return this._gaugeMap?.get(name)
  }

  public get gaugeMap(): Map<string, CustomGauge<string>> {
    // The default value can be used here without reporting an error
    if (!this._gaugeMap) {
      throw new Error(
        'Need to do the initialization operation first, gauge is empty',
      )
    }
    return this._gaugeMap
  }

  public get histogram(): Map<string, CustomHistogram<string>> {
    // The default value can be used here without reporting an error
    if (!this._histogram) {
      throw new Error(
        'Need to do the initialization operation first, histogram is empty',
      )
    }
    return this._histogram
  }

  public get register(): Registry | undefined {
    return client.register
  }

  private checkConfig(config: MetricConfiguration<string>) {
    if (!config || !config.help || !config.name) {
      throw new Error('Missing necessary parameters')
    }
  }
}

export default PrometheusClient
