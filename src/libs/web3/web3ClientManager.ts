import configs from '../../config'
import Web3Client from './web3Client'
import { ChainEnum, Web3ClientTypeEnum } from './web3Constant'
import getLogger from '../../utils/logger'
import BigNumber from 'bignumber.js'
import PrometheusMetricHelper from '../prometheus/prometheusMetricHelper'

const logger = getLogger('Web3Client Manager')

export default class Web3ClientManager {
  static instance: Web3ClientManager
  private web3Clients: { [chain: string]: Web3Client[] } = {
    [ChainEnum.BSC]: [],
    [ChainEnum.ETHEREUM]: [],
    [ChainEnum.POLYGON]: [],
  }
  private healthCheckTimer: any

  constructor() {
    // init web3 clients
    this.initWeb3Clients()
    // set health check timer
    this.setHealthCheckTimer()
  }

  /**
   * lazy singleton pattern
   */
  public static getInstance() {
    if (!Web3ClientManager.instance) {
      Web3ClientManager.instance = new Web3ClientManager()
    }
    return Web3ClientManager.instance
  }

  /**
   * Init all providers
   */
  private initWeb3Clients() {
    const { bscProviders, ethereumProviders } = configs.web3Config
    // init bsc providers
    bscProviders.forEach((p) => {
      this.web3Clients.bsc.push(new Web3Client({ ...p, chain: ChainEnum.BSC }))
    })
    logger.info(
      `bsc: ${this.web3Clients.bsc.length} Web3Clients has been initialized`,
    )

    // init ethereum providers
    ethereumProviders.forEach((p) => {
      this.web3Clients.ethereum.push(
        new Web3Client({ ...p, chain: ChainEnum.ETHEREUM }),
      )
    })
    logger.info(
      `ethereum: ${this.web3Clients.ethereum.length} Web3Clients has been initialized`,
    )
  }

  /**
   * init health checker timer
   */
  private setHealthCheckTimer() {
    if (this.healthCheckTimer) {
      clearTimeout(this.healthCheckTimer)
    }
    this.healthCheckTimer = setTimeout(() => {
      this.setHealthCheckTimer()
      this.healthCheck()
    }, configs.web3Config.healthCheckHeartbeatTime)
  }

  /**
   * All web3 client execute health check by their own
   */
  private healthCheck() {
    Object.keys(this.web3Clients).forEach((chain: string) => {
      // health check
      this.web3Clients[chain].forEach((c) => c.healthCheck())
    })
  }

  /**
   * Returns an "online" web3 provider with the highest priority
   * If no provider is online, return the one with the highest priority instead
   */
  public getWeb3Client(
    chain: ChainEnum = ChainEnum.BSC,
    type?: Web3ClientTypeEnum,
  ) {
    // filter providers by type
    const candidates = this.web3Clients[chain]
      .filter((p) => p.type === (type || Web3ClientTypeEnum.RPC))
      .sort((a, b) => b.priority - a.priority)
    // get 'online' provider
    const onlineCandidates = candidates.filter(
      (p) => p.status == Web3Client.WEB3CLIENT.STATUS.ONLINE,
    )
    // no online candidate is available
    if (!onlineCandidates.length) {
      return candidates[0]
    } else {
      // get available one with the highest priority
      return onlineCandidates[0]
    }
  }

  /**
   * Check current account balance
   * if the balance is lower than the lower limit,
   * (Lower limit is configured in Apollo)
   * alarm will be triggered
   * @param chain
   * @param type
   */
  public checkWalletBalance(
    chain: ChainEnum = ChainEnum.ETHEREUM,
    type: Web3ClientTypeEnum = Web3ClientTypeEnum.RPC,
  ) {
    const client = this.getWeb3Client(chain, type)
    const address = ''
    const balanceLimit = configs.web3Config.lowestBalance
    if (!address) {
      throw new Error('Node address is empty')
    }
    client
      .getBalance(address)
      .then((balance1) => {
        const balance = client.toDecimal(balance1)
        // send to prometheus
        // PrometheusMetricHelper.sendBalanceMetrics(chain, address, balance)
        // Warning if it's too low
        if (new BigNumber(balance).comparedTo(balanceLimit) <= 0) {
          logger.error(
            `Wallet balance reached the lowest limit: ${balance} (balance limit: ${balanceLimit}), wallet: ${address}`,
          )
        }
      })
      .catch((error) => {
        logger.error(`Get Balance error: ${error?.message}`, error)
      })
  }
}
