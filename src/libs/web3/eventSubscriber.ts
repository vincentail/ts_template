import Contract from 'web3-eth-contract'
import { ContractAbi } from 'web3-types'
import { ChainEnum, Web3ClientTypeEnum } from './web3Constant'
import Web3Client from '../../libs/web3/web3Client'
import getLogger from '../../utils/logger'
import Bluebird from 'bluebird'
import Web3ClientManager from './web3ClientManager'

const Logger = getLogger('EventListener')

interface ISubscript {
  web3Client: Web3Client
  contractEventSubscriptsMap: Map<string, IContractEventSubscript>
  eventSubscriptsMap: Map<string, IEventSubscript>
  connecting: boolean
}

interface IContractEventSubscript {
  contract: Contract<ContractAbi>
  abi: ContractAbi
  contractAddress: string
  event: string
  filter?: any
  callback?: any
  timeout: number // event timeout: Trigger reconnect when no event is received after this time
  eventTime: number // event time
  eventBlockNumber: number // the block number of latest event
}

interface IEventSubscript {
  event: string
  filter?: any
  callback?: any
  timeout: number // event timeout: Trigger reconnect when no event is received after this time
  eventTime: number // event time
  eventBlockNumber: number // the block number of latest event
}

export default class EventSubscriber {
  private subscriptsMap: Map<ChainEnum, ISubscript> = new Map<
    ChainEnum,
    ISubscript
  >()
  private healthCheckTimer: NodeJS.Timeout | undefined
  private checking = false
  private checkTime = Date.now()
  private static instance: EventSubscriber

  constructor() {
    this.setHealthCheckTimer()
  }

  /**
   * lazy singleton pattern
   */
  public static getInstance() {
    if (!EventSubscriber.instance) {
      EventSubscriber.instance = new EventSubscriber()
    }
    return EventSubscriber.instance
  }

  setHealthCheckTimer() {
    if (this.healthCheckTimer) {
      clearTimeout(this.healthCheckTimer)
    }
    this.healthCheckTimer = setTimeout(() => {
      this.setHealthCheckTimer()
      this.healthCheck().catch((e: any) => {
        Logger.error(`Event health check error: ${e?.message}`, e)
      })
    }, 30000)
  }

  async healthCheck() {
    if (this.checking && this.checkTime > Date.now() - 60000) {
      Logger.warn('Event health checking')
      return
    }
    this.checking = true
    this.checkTime = Date.now()
    try {
      await Bluebird.map(
        this.subscriptsMap.keys(),
        async (chain: ChainEnum) => {
          const subscript = this.subscriptsMap.get(chain)
          if (!subscript || subscript.contractEventSubscriptsMap.size <= 0) {
            return
          }
          // get latest block
          const web3Client =
            Web3ClientManager.getInstance().getWeb3Client(chain)
          const toBlock = (await web3Client.getBlockNumber()) - BigInt(3)
          await Bluebird.mapSeries(
            subscript.contractEventSubscriptsMap.values(),
            async (contractEventSubscript) => {
              const traceId = `${chain}-${contractEventSubscript.contractAddress}-${contractEventSubscript.event}`
              Logger.info(`${traceId} event health check start`)
              // fetch recently events
              const filter: any = {
                fromBlock: toBlock - BigInt(10),
                toBlock,
              }

              if (contractEventSubscript.filter) {
                Object.assign(filter, { ...contractEventSubscript.filter })
              }
              const events = await web3Client.getPastEvents({
                contract: web3Client.getContract(
                  chain,
                  contractEventSubscript.contractAddress,
                  contractEventSubscript.abi,
                ),
                event: contractEventSubscript.event,
                filter,
              })
              Logger.info(`${traceId} event size: ${events.length}`)
              if (events.length <= 0) {
                return
              }
              // get latest event
              // sort events in descending order
              events.sort((ea, eb) => {
                return Number(ea.blockNumber) - Number(eb.blockNumber) > 0
                  ? -1
                  : 1
              })
              const latestEventBlockNumber = events[0].blockNumber
              if (
                Number(latestEventBlockNumber) >
                  contractEventSubscript.eventBlockNumber &&
                contractEventSubscript.eventTime <
                  Date.now() - contractEventSubscript.timeout
              ) {
                // reconnect
                this.resubscribes(chain)
                throw new Error(
                  `${traceId} event timeout, event block number: ${latestEventBlockNumber} - ${contractEventSubscript.eventBlockNumber}`,
                )
              }
            },
          )
        },
        {
          concurrency: 2,
        },
      )
      Logger.info(
        `Event health check success, execution time: ${
          Date.now() - this.checkTime
        }`,
      )
    } catch (e: any) {
      Logger.error(`Event health check error: ${e?.message}`, e)
    } finally {
      this.checking = false
    }
  }

  /**
   * resubscribe
   * @param chain
   */
  resubscribes(chain: ChainEnum) {
    const subscript = this.subscriptsMap.get(chain)
    if (
      !subscript ||
      subscript.contractEventSubscriptsMap.size <= 0 ||
      subscript.connecting
    ) {
      return
    }
    try {
      subscript.connecting = true
      // Resets subscriptions.
      subscript.web3Client.clearSubscriptions()
      subscript.web3Client = Web3ClientManager.getInstance().getWeb3Client(
        chain,
        Web3ClientTypeEnum.WSS,
      )
      Object.keys(subscript.contractEventSubscriptsMap).forEach(
        (subscriptionId) => {
          const contractEventSubscript =
            subscript.contractEventSubscriptsMap.get(subscriptionId)
          if (!contractEventSubscript) {
            throw new Error('Contract subscription not found')
          }
          // update contract instance
          contractEventSubscript.contract = subscript.web3Client.getContract(
            chain,
            contractEventSubscript.contractAddress,
            contractEventSubscript.abi,
          )
          this.onEvent(chain, subscriptionId, true)
        },
      )
      Object.keys(subscript.eventSubscriptsMap).forEach((subscriptionId) => {
        const eventSubscript = subscript.eventSubscriptsMap.get(subscriptionId)
        if (!eventSubscript) {
          throw new Error('Contract subscription not found')
        }
        this.onEvent(chain, subscriptionId, false)
      })
    } catch (e: any) {
      Logger.error(`reconnect error: ${e?.meesage}`, e)
    } finally {
      subscript.connecting = false
    }
  }

  /**
   * on contract event
   * @param chain
   * @param subscriptId
   * @param isContractEvent whether is contract event type: 1- contract 0-blockchain event
   */
  async onEvent(chain: ChainEnum, subscriptId, isContractEvent = true) {
    const subscript = this.subscriptsMap.get(chain)
    if (!subscript) throw new Error('subscription not found')
    let eventSubscript
    let eventInstance
    let traceId
    if (isContractEvent) {
      eventSubscript = subscript.contractEventSubscriptsMap.get(subscriptId)
      const { event, contract, contractAddress, filter } = eventSubscript
      traceId = `${chain}-${contractAddress}-${event}`
      // listen to events
      eventInstance = contract.events[event](filter)
    } else {
      eventSubscript = subscript.eventSubscriptsMap.get(subscriptId)
      const { event, filter } = eventSubscript
      traceId = `${chain}-${event}`
      // listen to events
      eventInstance = await subscript.web3Client.web3.eth.subscribe(
        event,
        filter,
      )
    }
    const { callback } = eventSubscript
    // listen to events
    eventInstance.on('data', (event) => {
      Logger.info(`${traceId} subscript data event: ${JSON.stringify(event)}`)
      const time = Date.now()
      eventSubscript.eventTime = time
      eventSubscript.eventBlockNumber = event.blockNumber
      // handle event
      if (typeof callback === 'function') {
        callback({ ...event, chain, time: Math.floor(time / 1000) })
      }
    })
    eventInstance.on('changed', (event) => {
      Logger.info(
        `${traceId} subscript changed event: ${JSON.stringify(event)}`,
      )
      // remove event
      eventSubscript.eventTime = Date.now()
      // handle event
      if (typeof callback === 'function') {
        callback({ ...event, chain })
      }
    })
    eventInstance.on('connected', () => {
      eventSubscript.eventTime = Date.now()
      Logger.info(`Listening on event "${traceId}"`)
    })
    eventInstance.on('error', (err) => {
      Logger.error(
        `Event "${traceId}" subscription error: `,
        (err || {}).message,
      )
      if (!subscript.connecting) {
        // reconnect after 1 sec
        setTimeout(() => this.resubscribes(chain), 1000)
      }
    })
  }

  /**
   * set subscript
   * @param chain
   */
  initSubscript(chain = ChainEnum.ETHEREUM) {
    const subscript = {
      web3Client: Web3ClientManager.getInstance().getWeb3Client(
        chain,
        Web3ClientTypeEnum.WSS,
      ),
      contractEventSubscriptsMap: new Map<string, IContractEventSubscript>(),
      eventSubscriptsMap: new Map<string, IEventSubscript>(),
      connecting: false,
    }
    this.subscriptsMap.set(chain, subscript)
    return subscript
  }

  /**
   * Subscribe and start to lister to contract event
   */
  subscribeContractEvent({
    chain = ChainEnum.ETHEREUM,
    contractAddress,
    abi,
    event = 'allEvents',
    filter,
    callback,
    timeout = 600000,
  }: {
    chain: ChainEnum
    abi: ContractAbi
    contractAddress: string
    event: string
    filter: any
    callback?: any
    timeout: number
  }) {
    let subscript: ISubscript | undefined = this.subscriptsMap.get(chain)
    if (!subscript) {
      subscript = this.initSubscript(chain)
    }
    const contract = subscript.web3Client.getContract(
      chain,
      contractAddress,
      abi,
    )
    const subscriptionId = `${contractAddress}-${event}`
    if (event !== 'allEvents' && typeof contract.events[event] == 'function') {
      throw new Error(`Invalid event: ${subscriptionId}`)
    }
    if (subscript.contractEventSubscriptsMap.has(subscriptionId)) {
      Logger.warn(`Repeat subscription event: ${subscriptionId}`)
      return
    }
    const contractEventSubscript: IContractEventSubscript = {
      contract,
      abi,
      contractAddress,
      event,
      filter,
      callback,
      timeout,
      eventTime: 0,
      eventBlockNumber: 0,
    }
    subscript.contractEventSubscriptsMap.set(
      subscriptionId,
      contractEventSubscript,
    )
    this.onEvent(chain, subscriptionId)
  }

  /**
   * Subscribe and start to lister to blockchain event
   */
  subscribeEvent({
    chain = ChainEnum.ETHEREUM,
    event = 'logs',
    name,
    filter,
    callback,
    timeout = 600000,
  }: {
    chain: ChainEnum
    event: string
    name: string
    filter: any
    callback?: any
    timeout: number
  }) {
    let subscript: ISubscript | undefined = this.subscriptsMap.get(chain)
    if (!subscript) {
      subscript = this.initSubscript(chain)
    }
    const subscriptionId = `${event}-${name}`
    if (subscript.eventSubscriptsMap.has(subscriptionId)) {
      Logger.warn(`Repeat subscription event: ${subscriptionId}`)
      return
    }
    const eventSubscript: IEventSubscript = {
      event,
      filter,
      callback,
      timeout,
      eventTime: 0,
      eventBlockNumber: 0,
    }
    subscript.eventSubscriptsMap.set(subscriptionId, eventSubscript)
    this.onEvent(chain, subscriptionId, false)
  }
}
