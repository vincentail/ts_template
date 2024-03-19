import AbiCoder from 'web3-eth-abi'

export default class Web3Util {
  public static encodeFull(sig: string, args: any[]): [string[], string] {
    const types = Web3Util.findTypes(sig)

    const callData =
      <string>(<any>AbiCoder).encodeFunctionSignature(sig) +
      <string>(<any>AbiCoder).encodeParameters(types, args).slice(2)

    return [types, callData]
  }

  public static encodeParameters(types: any[], parameters: any[]): string {
    return <string>(<any>AbiCoder).encodeParameters(types, parameters)
  }

  public static decodeParameters(
    types: any[],
    hex: string,
  ): { [key: string]: any } {
    return <{ [key: string]: any }>(<any>AbiCoder).decodeParameters(types, hex)
  }

  private static findTypes(functionSig: string): string[] {
    // see https://github.com/ethereumjs/ethereumjs-abi/blob/master/lib/index.js#L81
    const parseSignature = (sig) => {
      const tmp = /^(\w+)\((.*)\)$/.exec(sig) || []

      if (tmp.length !== 3) {
        throw new Error('Invalid method signature')
      }

      const args = /^(.+)\):\((.+)$/.exec(tmp[2])

      if (args !== null && args.length === 3) {
        return {
          method: tmp[1],
          args: args[1].split(','),
          retargs: args[2].split(','),
        }
      } else {
        let params = tmp[2].split(',')
        if (params.length === 1 && params[0] === '') {
          // Special-case (possibly naive) fixup for functions that take no arguments.
          // match what the calling functions expect
          params = []
        }
        return {
          method: tmp[1],
          args: params,
        }
      }
    }

    return parseSignature(functionSig).args
  }

  /**
   * check if the error is an underprice error
   * @param errorMsg
   */
  public static isUnderpriceError(errorMsg: string) {
    return /^Returned error:( replacement)? transaction underpriced$/.test(
      errorMsg,
    )
  }
}
