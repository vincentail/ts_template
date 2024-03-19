import Web3, {
  BlockNumberOrTag,
  EventLog,
  HttpProvider,
  TransactionCall,
  WebSocketProvider,
} from 'web3'
import Contract from 'web3-eth-contract'
import { Logger } from 'log4js'
import { ContractAbi, Log } from 'web3-types'
import getLogger from '../../utils/logger'
import PrometheusMetricHelper from '../prometheus/prometheusMetricHelper'
import AbiCoder from 'web3-eth-abi'
import CommonUtil from '../../utils/commonUtil'
import { Chain, Common, CustomChain, Hardfork } from '@ethereumjs/common'
import { ChainEnum, Web3ClientTypeEnum } from './web3Constant'

export const ChainIdToCommonMap: { [key: string]: Common } = {
  56: Common.custom({ chainId: 56 }),
  97: Common.custom({ chainId: 97 }),
  1: new Common({ chain: Chain.Mainnet }),
  5: new Common({ chain: Chain.Goerli }),
  137: Common.custom(CustomChain.PolygonMainnet, {
    hardfork: Hardfork.SpuriousDragon,
    // eips: [Capability.EIP155ReplayProtection],
  }),
  80001: Common.custom(CustomChain.PolygonMumbai, {
    hardfork: Hardfork.SpuriousDragon,
    // eips: [Capability.EIP155ReplayProtection],
  }),
}

export interface Web3ClientConfig {
  chain: ChainEnum
  endpoint: string
  type: Web3ClientTypeEnum
  priority: number
}

/**
 * @description web3 client
 * @author yq
 * @date 2022/6/30 11:00
 */
class Web3Client {
  public readonly web3: Web3
  chain: ChainEnum
  endpoint: string
  chainId: bigint | undefined
  type: Web3ClientTypeEnum
  priority: number
  status: number
  logger: Logger
  private contractsMap: Map<string, Contract<any>> = new Map<
    string,
    Contract<any>
  >()
  static readonly WEB3CLIENT: any = {
    STATUS: {
      OFFLINE: -1,
      ONLINE: 1,
    },
  }

  constructor(config: Web3ClientConfig) {
    if (!config) {
      throw new Error('Missing config')
    }
    this.chain = config.chain
    this.endpoint = config.endpoint
    this.type = config.type
    this.priority = config.priority
    this.status = Web3Client.WEB3CLIENT.STATUS.ONLINE
    this.logger = getLogger(
      `Web3Client(${this.chain}-${this.type}-${
        this.priority
      }-${CommonUtil.getEndpoint(this.endpoint)})`,
    )
    this.web3 = new Web3()
    this.setProvider()
    this.healthCheck()
  }

  /**
   * Healthcheck by testing whether we are able to get batch id or not
   */
  healthCheck() {
    const startTime = Date.now()
    this.logger.info('health check start')
    this.web3.eth
      .getBlockNumber()
      .then((blockNumber) => {
        if (/^d+$/.test(String(blockNumber))) {
          this.connectionAbnormal(new Error('Health check failed'))
        } else {
          this.logger.info(
            `health check success -- ${Date.now() - startTime}ms`,
          )
          this.status = Web3Client.WEB3CLIENT.STATUS.ONLINE
          // PrometheusMetricHelper.sendProviderStatusMetric(
          //   this.chain,
          //   this.type,
          //   this.priority,
          //   this.status,
          // )
        }
      })
      .catch((err) => {
        this.connectionAbnormal(err)
      })
  }

  /**
   * Returns a provider with different types
   */
  public getProvider() {
    return this.type === Web3ClientTypeEnum.RPC
      ? new HttpProvider(this.endpoint)
      : new WebSocketProvider(
          this.endpoint,
          {},
          {
            autoReconnect: true,
            delay: 5000, // ms
            maxAttempts: 100000,
          },
        )
  }

  /**
   * Returns chainId of the provider
   */
  public async getChainId(): Promise<bigint> {
    if (!this.chainId) {
      this.chainId = await this.web3.eth.getChainId()
    }
    return this.chainId
  }

  /**
   * Returns chainId of the provider
   */
  public async getCommon() {
    const chainId = await this.getChainId()
    return ChainIdToCommonMap[chainId.toString()] || ChainIdToCommonMap[1]
  }

  /**
   * Set provider with Web3
   * Must execute before we use the client
   */
  public setProvider() {
    this.web3.setProvider(this.getProvider())
  }

  /**
   * Mark self as offline and start auto recover process
   */
  connectionAbnormal(error) {
    // label it as an offline provider
    this.status = Web3Client.WEB3CLIENT.STATUS.OFFLINE
    // PrometheusMetricHelper.sendProviderStatusMetric(
    //   this.chain,
    //   this.type,
    //   this.priority,
    //   this.status,
    // )
    this.logger.error(`client is offline, error: ${error?.message}`)
    // refresh provider and waiting for next health check
    this.setProvider()
  }

  /**************************************************
   *                Basic operations                 *
   **************************************************/

  /**
   * List accounts
   */
  public async getAccounts(): Promise<string[]> {
    this.checkParam()
    return this.web3.eth.getAccounts()
  }

  /**
   * Get account balance in the unit of Wei
   * @param address
   */
  public async getBalance(address: string): Promise<bigint> {
    this.checkParam()
    return this.web3.eth.getBalance(address)
  }

  /**
   * Get current gas price of the chain
   */
  public async getGasPrice(): Promise<bigint> {
    this.checkParam()
    return this.web3.eth.getGasPrice()
  }

  /**
   * Estimate gas will be consumed before transaction is made
   * @param transactionConfig
   *           from address
   *           to address
   *           data encoded transaction data
   */
  public async estimateGas(transactionConfig): Promise<bigint> {
    this.checkParam()
    return this.web3.eth.estimateGas(transactionConfig)
  }

  /**
   * Returns the detail of a transaction
   * Including: nonce, blockNumber, from, to, value, gas(provided by the sender) and gasPrice
   * @param txHash
   */
  public async getTransaction(txHash: string) {
    this.checkParam()
    return this.web3.eth.getTransaction(txHash)
  }

  /**
   * Returns the receipt of a transaction by transaction hash
   * Including: gasUsed
   * @param txHash
   */
  public async getTransactionReceipt(txHash: string) {
    this.checkParam()
    return this.web3.eth.getTransactionReceipt(txHash)
  }

  /**
   * Returns the latest block number
   */
  public getBlockNumber(): Promise<bigint> {
    return this.web3.eth.getBlockNumber()
  }

  /**
   * Returns the block by block number
   * Including: gasUsed
   * @param blockNumber
   */
  public async getBlock(blockNumber: number) {
    this.checkParam()
    return this.web3.eth.getBlock(blockNumber)
  }

  /**
   * Returns past events within a range of blocks of a specific event of a contract
   * @param contract
   * @param event
   * @param filter
   */
  public getPastEvents({
    contract,
    event,
    filter = { fromBlock: 'latest', toBlock: 'latest' },
  }: {
    contract: Contract<ContractAbi>
    event: any
    filter?: any
  }): Promise<EventLog[]> {
    return contract.getPastEvents(event, filter) as Promise<EventLog[]>
  }

  /**
   * Get the history logs matching the given criteria.
   * @param fromBlock Starting blocks
   * @param toBlock End block
   * @param topics
   */
  public getPastLogs({ fromBlock, toBlock, topics }): Promise<Log[]> {
    return this.web3.eth.getPastLogs({
      fromBlock,
      toBlock,
      topics,
    }) as Promise<Log[]>
  }

  /**
   * Transform number with "Wei" unit to a decimal number
   * @param number
   */
  public toDecimal(number: bigint | string): string {
    return this.web3.utils.fromWei(number, 'ether')
  }

  /**************************************************
   *                  Core method                   *
   **************************************************/
  /**
   * Calling the contract's view, pure type method
   * @param address Contract-Address
   * @param abi Method abi
   * @param args Matches the parameter in parentheses in the method signature
   * @param returns Same as sig, signature of the returned content for the contract method，e.g. returns (returnType1, returnType2)
   */
  public async viewMethod(
    address: string,
    abi: any,
    args: any[],
    returns: any,
  ): Promise<any> {
    this.checkParam()
    const data = AbiCoder.encodeFunctionCall(abi, args)
    const call = <TransactionCall>{
      data,
      to: address,
    }
    const result = await this.web3.eth.call(call)
    if (Array.isArray(returns)) {
      if (!result) {
        return []
      }
      return AbiCoder.decodeParameters(returns, result)
    } else {
      if (!result) {
        return {}
      }
      return AbiCoder.decodeParameter(returns, result)
    }
  }

  /**
   * Returns a contract object
   * @param chain
   * @param contractAddress
   * @param abi
   */
  public getContract(
    chain: ChainEnum,
    contractAddress: string,
    abi: ContractAbi | any,
  ): Contract<ContractAbi> {
    const key = `${chain}-${contractAddress}`
    if (!this.contractsMap.has(key)) {
      this.contractsMap.set(
        key,
        new this.web3.eth.Contract(abi, contractAddress),
      )
    }
    return <Contract<ContractAbi>>this.contractsMap.get(key)
  }

  public async call(config) {
    return this.web3.eth.call(config)
  }

  /**
   * Returns transaction count including pending blocks
   * @param account
   * @param defaultBlock
   */
  public async getTransactionCount(
    account: string,
    defaultBlock: BlockNumberOrTag = 'pending',
  ): Promise<bigint> {
    this.checkParam()
    return this.web3.eth.getTransactionCount(account, defaultBlock)
  }

  public encodeFunctionCall(abi: any, param: any): string {
    return this.web3.eth.abi.encodeFunctionCall(abi, param)
  }

  /**************************************************
   *                  Subscriptions Method                *
   **************************************************/
  /**
   * Cancel all active subscriptions
   */
  public clearSubscriptions() {
    this.web3.eth.clearSubscriptions()?.catch((error) => {
      this.logger.error(`Error on clearSubscription: ${error?.message}`, error)
    })
  }

  /**************************************************
   *                  General Method                *
   **************************************************/
  /**
   * Determine whether the web3 object has been initialized, i.e., by the constructor new
   * TODO It should be possible to optimize the call
   * @private
   */
  private checkParam() {
    if (!this.web3) {
      throw new Error('Please initialize first')
    }
  }
}

export default Web3Client
