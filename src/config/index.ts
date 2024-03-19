import { Web3ClientConfig } from '../libs/web3/web3Client'
import ErrorCode from '../libs/api/response/errorCode'
import { IpUtil } from '../utils/ipUtil'

export const IS_PROD = process.env.NODE_ENV === 'production'

export const PROMETHEUS = {
  METRIC_NAME: {
  },
}

export const Config = {
  /**
   *  app config
   */
  appConfig: {
    port: 8081,
    node: IpUtil.getLocalIp(),
    sqlLog: false, // sql log
    errorMsgToCodeMapping: {
      unknown: ErrorCode.UNKNOWN,
      failed: ErrorCode.TRANSACTION_FAILED,
      'Returned error: nonce too low': ErrorCode.TRANSACTION_FAILED,
      'Returned error: transaction underpriced': ErrorCode.TRANSACTION_FAILED,
      'Returned error: replacement transaction underpriced':
        ErrorCode.TRANSACTION_FAILED,
      'Returned error: intrinsic gas too low': ErrorCode.TRANSACTION_FAILED,
      'Returned error: execution reverted': ErrorCode.INVALID_ORDER,
      'Returned error: insufficient funds for gas * price + value':
        ErrorCode.INSUFFICIENT_BALANCE,
      'Request signature api failed': ErrorCode.SIGNATURE_FAILED,
      'Gas fee too high, insufficient payment amount':
        ErrorCode.INSUFFICIENT_PAYMENT_AMOUNT,
      'Order expired': ErrorCode.ORDER_EXPIRED,
      'Order fulfilled': ErrorCode.ORDER_FULFILLED,
      'Invalid order': ErrorCode.INVALID_ORDER,
      'Invalid checksum': ErrorCode.INVALID_CHECKSUM,
    },
  },
  /**
   *  ------- Apollo config -------
   */
  apolloConfig: {
    appId: '',
    namespaces: ['application'],
  },
  /**
   *  ------- Web3 account configs -------
   */
  web3Config: {
    timeoutTolerance: 60000,
    gasPriceMultiplier: 1.1,
    gasLimitMultiplier: 1.5,
    gasFeeMultiplier: 10, // gas fee multiplier, fail the transaction with gas fee greater than withholding fee * gasFeeMultiplier
    lowestBalance: 1, // unit: BNB
    confirmationEstTime: 3000, // default 3 second for block confirmation
    maxRetryTime: 5, // retry times
    healthCheckHeartbeatTime: 10000, // Health check heartbeat time, in milliseconds
    // how long to reconnect when there is no event for some time
    eventSilentMaxTime: 60000,
    failureErrorRegexMapping: {
      '^Returned error: insufficient funds for gas * price + value':
        'Returned error: insufficient funds for gas * price + value',
    },
    unknownErrorRegexes: [],
    // ----------- BSC Providers -----------
    bscProviders: <Array<Web3ClientConfig>>[
      {
        endpoint: process.env.BSC_RPC_PROVIDER_URL || '',
        priority: 4,
        type: 'rpc',
      },
      // wss providers
      {
        endpoint: process.env.BSC_WSS_PROVIDER_URL || '',
        priority: 3,
        type: 'wss',
      },
    ],
    // ----------- Ethereum Providers -----------
    ethereumProviders: <Array<Web3ClientConfig>>[
      {
        endpoint: process.env.ETHEREUM_RPC_PROVIDER_URL || '',
        priority: 4,
        type: 'rpc',
      },
      // wss providers
      {
        endpoint: process.env.ETHEREUM_WSS_PROVIDER_URL || '',
        priority: 4,
        type: 'wss',
      },
    ],
  },
  /**
   *  ------- prometheus server configs -------
   */
  promServerConfig: {
    endpoint: 'http://localhost:28081',
    metricConfig: [],
  },
  /**
   *  ------- redis configs -------
   */
  redisConfig: {
    node: {
      host: process.env.REDIS_HOST || '',
      port: process.env.REDIS_PORT || 0,
      db: process.env.REDIS_DB || 0,
      password: process.env.REDIS_PASSWORD || '',
      prefix: 'node-api:',
      mode: 'cluster',
    },
  },
  /**
   *  ------- mysql configs -------
   */
  mysqlConfig: {
    node: {
      write: {
        host: process.env.MYSQL_WRITE_HOST || '',
        port: process.env.MYSQL_WRITE_PORT || 0,
        username: process.env.MYSQL_USERNAME || '',
        password: process.env.MYSQL_PASSWORD || '',
        database: process.env.MYSQL_DATABASE || '',
        charset: 'utf8mb4_general_ci',
        timezone: 'local', // local, Z, +HH:MM or -HH:MM
        connectionLimit: process.env.MYSQL_WRITE_CONNECTION_LIMIT || 5,
        maxIdle: process.env.MYSQL_WRITE_MAX_IDLE || 1,
        idleTimeout: process.env.MYSQL_WRITE_IDLE_TIMEOUT || 60000,
        // acquireTimeout: 30000,
        multipleStatements: true,
        supportBigNumbers: true,
        bigNumberStrings: true,
        dateStrings: true,
      },
      read: {
        host: process.env.MYSQL_READ_HOST || '',
        port: process.env.MYSQL_READ_PORT || 0,
        username: process.env.MYSQL_USERNAME || '',
        password: process.env.MYSQL_PASSWORD || '',
        database: process.env.MYSQL_DATABASE || '',
        charset: 'utf8mb4_general_ci',
        timezone: 'local', // local, Z, +HH:MM or -HH:MM
        connectionLimit: process.env.MYSQL_READ_CONNECTION_LIMIT || 5,
        maxIdle: process.env.MYSQL_READ_MAX_IDLE || 1,
        idleTimeout: process.env.MYSQL_READ_IDLE_TIMEOUT || 60000,
        // acquireTimeout: 30000,
        multipleStatements: true,
        supportBigNumbers: true,
        bigNumberStrings: true,
        dateStrings: true,
      },
    },
  },
  /**
   *  ------- kafka configs -------
   */
  kafkaConfig: {
    clientId: 'node-client',
    brokers: '',
    channelOrder: {
      topic: '',
      consumerGroupId: '',
      orderEventTopic: '',
    },
    openListing: {
      topic: '',
      consumerGroupId: '',
      openListingEventTopic: '',
    },
    eventConfig: {
      marketplaceEventTopic: '',
    },
  },
  checksumConfig: {
    channelOrderSalt: '',
  },
  grayscaleConfig: {
    ratio: 0,
    uids: ['180373343'],
  },
  contractConfig: {
    bsc: {
      borrowerOperationsAddress: '',
    },
    ethereum: {
      borrowerOperationsAddress: '0xb25346A11ce135B45030F4bdAf502045c69982ea',
    },
  },
  eventConfig: {
    opensea: {
      address: '0x00000000006c3852cbEf3e08E8dF289169EdE581',
      whiteList: [],
      eventTypeList: [
        'OrderCancelled',
        'OrderFulfilled',
        'OwnershipTransferred',
        'CounterIncremented',
      ],
    },
  },
  securityConfig: {
    signatureSalt: '',
  },
  marketplaceConfig: {
    opensea: {
      apiKey: '',
      unknownErrors: <Array<string>>[],
      errors: <Array<string>>[],
    },
  },
  systemParamsConfig: {
    liquidationICR: 3.1,
  },
  telegram:{
    token:'',
  }

}

export default Config
