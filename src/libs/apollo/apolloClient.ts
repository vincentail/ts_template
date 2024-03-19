import Config from '../../config'
import { ConfigHandlerService } from './configHandlerService'
import Apollo from './apollo'

export const APOLLO_CONFIG_KEY_MAPS = [
  {
    localKeys: ['appConfig', 'sqlLog'],
    remoteKeys: ['app.sql-log'],
  },
  {
    localKeys: ['appConfig', 'errorMsgToCodeMapping'],
    remoteKeys: ['app.error-msg-to-code-mapping'],
  },
  {
    localKeys: ['nodeSecretsManagerConfig', 'region'],
    remoteKeys: ['com.binance.secretsManager.region'],
  },
  {
    localKeys: ['nodeSecretsManagerConfig', 'secretName'],
    remoteKeys: ['com.binance.secretsManager.secretName'],
  },
  {
    localKeys: ['redisConfig', 'node', 'host'],
    remoteKeys: ['redis.node.host'],
  },
  {
    localKeys: ['redisConfig', 'node', 'port'],
    remoteKeys: ['redis.node.port'],
  },
  {
    localKeys: ['redisConfig', 'node', 'password'],
    remoteKeys: ['redis.node.password'],
  },
  {
    localKeys: ['redisConfig', 'node', 'prefix'],
    remoteKeys: ['redis.node.prefix'],
  },
  {
    localKeys: ['redisConfig', 'node', 'mode'],
    remoteKeys: ['redis.node.mode'],
  },
  {
    localKeys: ['mysqlConfig', 'node', 'write', 'host'],
    remoteKeys: ['mysql.node.write.host'],
  },
  {
    localKeys: ['mysqlConfig', 'node', 'write', 'port'],
    remoteKeys: ['mysql.node.write.port'],
  },
  {
    localKeys: ['mysqlConfig', 'node', 'write', 'username'],
    remoteKeys: ['mysql.node.write.username'],
  },
  {
    localKeys: ['mysqlConfig', 'node', 'write', 'password'],
    remoteKeys: ['mysql.node.write.password'],
  },
  {
    localKeys: ['mysqlConfig', 'node', 'write', 'database'],
    remoteKeys: ['mysql.node.write.database'],
  },
  {
    localKeys: ['mysqlConfig', 'node', 'write', 'connectionLimit'],
    remoteKeys: ['mysql.node.write.connectionLimit'],
  },
  {
    localKeys: ['mysqlConfig', 'node', 'write', 'maxIdle'],
    remoteKeys: ['mysql.node.write.maxIdle'],
  },
  {
    localKeys: ['mysqlConfig', 'node', 'write', 'idleTimeout'],
    remoteKeys: ['mysql.node.write.idleTimeout'],
  },
  // {
  //   localKeys: ['mysqlConfig', 'node', 'write', 'acquireTimeout'],
  //   remoteKeys: ['mysql.node.write.acquireTimeout'],
  // },
  {
    localKeys: ['mysqlConfig', 'node', 'read', 'host'],
    remoteKeys: ['mysql.node.read.host'],
  },
  {
    localKeys: ['mysqlConfig', 'node', 'read', 'port'],
    remoteKeys: ['mysql.node.read.port'],
  },
  {
    localKeys: ['mysqlConfig', 'node', 'read', 'username'],
    remoteKeys: ['mysql.node.read.username'],
  },
  {
    localKeys: ['mysqlConfig', 'node', 'read', 'password'],
    remoteKeys: ['mysql.node.read.password'],
  },
  {
    localKeys: ['mysqlConfig', 'node', 'read', 'database'],
    remoteKeys: ['mysql.node.read.database'],
  },
  {
    localKeys: ['mysqlConfig', 'node', 'read', 'connectionLimit'],
    remoteKeys: ['mysql.node.read.connectionLimit'],
  },
  {
    localKeys: ['mysqlConfig', 'node', 'read', 'maxIdle'],
    remoteKeys: ['mysql.node.read.maxIdle'],
  },
  {
    localKeys: ['mysqlConfig', 'node', 'read', 'idleTimeout'],
    remoteKeys: ['mysql.node.read.idleTimeout'],
  },
  // {
  //   localKeys: ['mysqlConfig', 'node', 'read', 'acquireTimeout'],
  //   remoteKeys: ['mysql.node.read.acquireTimeout'],
  // },
  {
    localKeys: ['mysqlConfig', 'aggregatorProxy', 'write', 'host'],
    remoteKeys: ['mysql.aggregator-proxy.write.host'],
  },
  {
    localKeys: ['mysqlConfig', 'aggregatorProxy', 'write', 'port'],
    remoteKeys: ['mysql.aggregator-proxy.write.port'],
  },
  {
    localKeys: ['mysqlConfig', 'aggregatorProxy', 'write', 'username'],
    remoteKeys: ['mysql.aggregator-proxy.write.username'],
  },
  {
    localKeys: ['mysqlConfig', 'aggregatorProxy', 'write', 'password'],
    remoteKeys: ['mysql.aggregator-proxy.write.password'],
  },
  {
    localKeys: ['mysqlConfig', 'aggregatorProxy', 'write', 'database'],
    remoteKeys: ['mysql.aggregator-proxy.write.database'],
  },
  {
    localKeys: ['mysqlConfig', 'aggregatorProxy', 'write', 'connectionLimit'],
    remoteKeys: ['mysql.aggregator-proxy.write.connectionLimit'],
  },
  {
    localKeys: ['mysqlConfig', 'aggregatorProxy', 'write', 'maxIdle'],
    remoteKeys: ['mysql.aggregator-proxy.write.maxIdle'],
  },
  {
    localKeys: ['mysqlConfig', 'aggregatorProxy', 'write', 'idleTimeout'],
    remoteKeys: ['mysql.aggregator-proxy.write.idleTimeout'],
  },
  // {
  //   localKeys: ['mysqlConfig', 'aggregatorProxy', 'write', 'acquireTimeout'],
  //   remoteKeys: ['mysql.aggregator-proxy.write.acquireTimeout'],
  // },
  {
    localKeys: ['mysqlConfig', 'aggregatorProxy', 'read', 'host'],
    remoteKeys: ['mysql.aggregator-proxy.read.host'],
  },
  {
    localKeys: ['mysqlConfig', 'aggregatorProxy', 'read', 'port'],
    remoteKeys: ['mysql.aggregator-proxy.read.port'],
  },
  {
    localKeys: ['mysqlConfig', 'aggregatorProxy', 'read', 'username'],
    remoteKeys: ['mysql.aggregator-proxy.read.username'],
  },
  {
    localKeys: ['mysqlConfig', 'aggregatorProxy', 'read', 'password'],
    remoteKeys: ['mysql.aggregator-proxy.read.password'],
  },
  {
    localKeys: ['mysqlConfig', 'aggregatorProxy', 'read', 'database'],
    remoteKeys: ['mysql.aggregator-proxy.read.database'],
  },
  {
    localKeys: ['mysqlConfig', 'aggregatorProxy', 'read', 'connectionLimit'],
    remoteKeys: ['mysql.aggregator-proxy.read.connectionLimit'],
  },
  {
    localKeys: ['mysqlConfig', 'aggregatorProxy', 'read', 'maxIdle'],
    remoteKeys: ['mysql.aggregator-proxy.read.maxIdle'],
  },
  {
    localKeys: ['mysqlConfig', 'aggregatorProxy', 'read', 'idleTimeout'],
    remoteKeys: ['mysql.aggregator-proxy.read.idleTimeout'],
  },
  // {
  //   localKeys: ['mysqlConfig', 'aggregatorProxy', 'read', 'acquireTimeout'],
  //   remoteKeys: ['mysql.aggregator-proxy.read.acquireTimeout'],
  // },
  {
    localKeys: ['kafkaConfig', 'name'],
    remoteKeys: ['kafka.name'],
  },
  {
    localKeys: ['kafkaConfig', 'clientId'],
    remoteKeys: ['kafka.client-id'],
  },
  {
    localKeys: ['kafkaConfig', 'brokers'],
    remoteKeys: ['kafka.brokers'],
  },
  {
    localKeys: ['kafkaConfig', 'channelOrder', 'topic'],
    remoteKeys: ['kafka.channel-order.topic'],
  },
  {
    localKeys: ['kafkaConfig', 'channelOrder', 'consumerGroupId'],
    remoteKeys: ['kafka.channel-order.consumer.group-id'],
  },
  {
    localKeys: ['kafkaConfig', 'channelOrder', 'nodeOrderEventTopic'],
    remoteKeys: ['kafka.channel-order.node-order-event-topic'],
  },
  {
    localKeys: ['kafkaConfig', 'openListing', 'topic'],
    remoteKeys: ['kafka.open-listing.topic'],
  },
  {
    localKeys: ['kafkaConfig', 'openListing', 'consumerGroupId'],
    remoteKeys: ['kafka.open-listing.consumer.group-id'],
  },
  {
    localKeys: ['kafkaConfig', 'openListing', 'openListingEventTopic'],
    remoteKeys: ['kafka.open-listing.open-listing-event-topic'],
  },
  {
    localKeys: ['kafkaConfig', 'eventConfig', 'nodeMarketplaceEventTopic'],
    remoteKeys: ['kafka.event-config.node-marketplace-event-topic'],
  },
  {
    localKeys: ['web3Config', 'bscProviders'],
    remoteKeys: ['web3.bsc-providers'],
  },
  {
    localKeys: ['web3Config', 'ethereumProviders'],
    remoteKeys: ['web3.ethereum-providers'],
  },
  {
    localKeys: ['web3Config', 'polygonProviders'],
    remoteKeys: ['web3.polygon-providers'],
  },
  {
    localKeys: ['web3Config', 'gasPriceMultiplier'],
    remoteKeys: ['web3.gas-price-multiplier'],
  },
  {
    localKeys: ['web3Config', 'gasLimitMultiplier'],
    remoteKeys: ['web3.gas-limit-multiplier'],
  },
  {
    localKeys: ['web3Config', 'gasFeeMultiplier'],
    remoteKeys: ['web3.gas-fee-multiplier'],
  },
  {
    localKeys: ['web3Config', 'healthCheckHeartbeatTime'],
    remoteKeys: ['web3.health-check-heartbeat-time'],
  },
  {
    localKeys: ['web3Config', 'failureErrorRegexMapping'],
    remoteKeys: ['web3.failure-error-regex-mapping'],
  },
  {
    localKeys: ['web3Config', 'unknownErrorRegexes'],
    remoteKeys: ['web3.unknown-error-regexes'],
  },
  {
    localKeys: ['signatureConfig', 'endpoint'],
    remoteKeys: ['signature.endpoint'],
  },
  {
    localKeys: ['signatureConfig', 'randomStr'],
    remoteKeys: ['signature.random-str'],
  },
  {
    localKeys: ['signatureConfig', 'bsc', 'paymentAddresses'],
    remoteKeys: ['signature.bsc.payment-addresses'],
  },
  {
    localKeys: ['signatureConfig', 'bsc', 'recipientAddress'],
    remoteKeys: ['signature.bsc.recipient-address'],
  },
  {
    localKeys: ['signatureConfig', 'bsc', 'seaportAddress'],
    remoteKeys: ['signature.bsc.seaport-address'],
  },
  {
    localKeys: ['signatureConfig', 'ethereum', 'paymentAddresses'],
    remoteKeys: ['signature.ethereum.payment-addresses'],
  },
  {
    localKeys: ['signatureConfig', 'ethereum', 'recipientAddress'],
    remoteKeys: ['signature.ethereum.recipient-address'],
  },
  {
    localKeys: ['signatureConfig', 'ethereum', 'seaportAddress'],
    remoteKeys: ['signature.ethereum.seaport-address'],
  },
  {
    localKeys: ['signatureConfig', 'polygon', 'paymentAddresses'],
    remoteKeys: ['signature.polygon.payment-addresses'],
  },
  {
    localKeys: ['signatureConfig', 'polygon', 'recipientAddress'],
    remoteKeys: ['signature.polygon.recipient-address'],
  },
  {
    localKeys: ['signatureConfig', 'polygon', 'seaportAddress'],
    remoteKeys: ['signature.polygon.seaport-address'],
  },
  {
    localKeys: ['checksumConfig', 'channelOrderSalt'],
    remoteKeys: ['checksum.channel-order-salt'],
  },
  {
    localKeys: ['grayscaleConfig', 'ratio'],
    remoteKeys: ['grayscale.ratio'],
  },
  {
    localKeys: ['grayscaleConfig', 'uids'],
    remoteKeys: ['grayscale.uids'],
  },
  {
    localKeys: ['contractConfig', 'seaportAddress'],
    remoteKeys: ['contract.seaport-address'],
  },
  {
    localKeys: ['contractConfig', 'depositAddress'],
    remoteKeys: ['contract.deposit-address'],
  },
  {
    localKeys: ['websocketConfig', 'opensea', 'apiKey'],
    remoteKeys: ['websocket.opensea.api-key'],
  },
  {
    localKeys: ['websocketConfig', 'opensea', 'logLevel'],
    remoteKeys: ['websocket.opensea.log-level'],
  },
  {
    localKeys: ['websocketConfig', 'opensea', 'collectionSlug'],
    remoteKeys: ['websocket.opensea.collection-slug'],
  },
  {
    localKeys: ['websocketConfig', 'opensea', 'networkType'],
    remoteKeys: ['websocket.opensea.network-type'],
  },
  {
    localKeys: ['eventConfig', 'opensea', 'address'],
    remoteKeys: ['event.opensea.address'],
  },
  {
    localKeys: ['eventConfig', 'opensea', 'whiteList'],
    remoteKeys: ['event.opensea.white-list'],
  },
  {
    localKeys: ['eventConfig', 'opensea', 'eventTypeList'],
    remoteKeys: ['event.opensea.event-type-list'],
  },
  {
    localKeys: ['securityConfig', 'signatureSalt'],
    remoteKeys: ['security.signature-salt'],
  },
  {
    localKeys: ['marketplaceConfig', 'opensea', 'apiKey'],
    remoteKeys: ['marketplace.opensea.api-key'],
  },
]

export default class ApolloClient {
  apollo: Apollo | undefined
  private static serviceEndpoint: string = process.env.APOLLO_ENDPOINT || ''
  static instance: ApolloClient

  constructor() {
    if (!ApolloClient.serviceEndpoint) {
      console.log('Apollo service endpoint is empty.')
      return
    }
    this.apollo = new Apollo({
      configServerUrl: ApolloClient.serviceEndpoint,
      appId: Config.apolloConfig.appId,
      namespaces: Config.apolloConfig.namespaces,
    })
  }

  /**
   * 懒汉单例模式
   * @returns {ApolloClient}
   */
  static getInstance(): ApolloClient {
    if (!ApolloClient.instance) {
      ApolloClient.instance = new ApolloClient()
    }
    return ApolloClient.instance
  }

  /**
   * The entry point of fetching configurations from Apollo
   */
  async start() {
    if (!this.apollo) {
      return
    }
    await this.apollo.init()
    // 获取所有配置
    const configs = this.apollo.getConfigs()
    this.handleConfigChanges(configs)
    // start to listening
    this.apollo.onChange((apolloConfigs) => {
      this.handleConfigChanges(apolloConfigs)
    })
  }

  /**
   * Process handlers by input configs from Apollo
   * @param apolloConfigs
   */
  handleConfigChanges(apolloConfigs) {
    // search all handlers of each namespace
    const configs = {}
    Config.apolloConfig.namespaces.forEach((namespace: string) => {
      if (
        apolloConfigs[namespace] &&
        apolloConfigs[namespace].configurations // configuration should exist in each namespace
      ) {
        // update config
        Object.assign(configs, apolloConfigs[namespace].configurations)
      }
    })
    ConfigHandlerService.handler(configs, APOLLO_CONFIG_KEY_MAPS)
  }
}
