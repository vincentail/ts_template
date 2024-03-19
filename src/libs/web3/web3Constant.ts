/**
 * @description web3 constant
 * @author yq
 * @date 2022/10/13 17:32
 */

export enum Web3ClientTypeEnum {
  WSS = 'wss',
  RPC = 'rpc',
}

export enum ChainEnum {
  BSC = 'bsc',
  ETHEREUM = 'ethereum',
  POLYGON = 'polygon',
}

export enum UnitEnum {
  ETHER = 'ether',
}

export enum NetworkToChainEnum {
  BSC = ChainEnum.BSC,
  ETH = ChainEnum.ETHEREUM,
  Polygon = ChainEnum.POLYGON,
}
