/**
 * @description abi constant
 * @author yq
 * @date 2022/11/15 18:38
 */
import { ContractAbi } from 'web3-types/src/eth_abi_types'
import Config from '../../config'
import BorrowerOperationsAbi from './abi/BorrowerOperations.json'
import { ERC721ABI } from './abi/ERC721'
import { ERC20ABI } from './abi/ERC20'
import { ERC1155ABI } from './abi/ERC1155'

export default class AbiUtil {
  /**
   * get abi
   * @param type
   */
  static getAbi(type: string): ContractAbi {
    switch (type) {
      case 'ERC721':
        return ERC721ABI
      case 'ERC1155':
        return ERC1155ABI
      case 'ERC20':
        return ERC20ABI
      case Config.contractConfig.ethereum.borrowerOperationsAddress:
        return BorrowerOperationsAbi as ContractAbi
      default: {
        throw new Error('ABI does not exist')
      }
    }
  }
}
