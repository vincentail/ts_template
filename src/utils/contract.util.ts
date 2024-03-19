import { Contract } from 'web3-eth-contract'
import getLogger from '../utils/logger'

const logger = getLogger('ContractInteractionService')

/**
 * when server restart we must compensate data. select the log table, if the
 * requests are un_confirmed, then add them to the memory and let the queue
 * service to deal
 */
export default class ContractInteractionService {
  /**
   * @param contract
   * @param method
   * @param params
   * @param extraParams
   */
  static async contractCall(
    contract: Contract<any>,
    method: string,
    params: Array<any>,
    extraParams?: any,
  ): Promise<any> {
    const result = await this.methodsCall(contract, method, params, extraParams)
    logger.info(`method:${method}, result:${result}`)
    return result
  }
  /**
   * call contract method by input params
   * @param contract
   * @param method
   * @param params
   * @param extraParams
   */
  static async methodsCall(contract, method, params, extraParams) {
    let result
    if (extraParams) {
      result = await contract.methods[method](...params).call(extraParams)
    } else {
      result = await contract.methods[method](...params).call()
    }
    return result
  }
}
