import * as ethUtil from '@ethereumjs/util'
import BN from 'bn.js'
import { recover } from 'web3-eth-accounts'

export function recoverPubKeyFromSig(msg: Buffer, r: BN, s: BN, v: number) {
  console.log(
    'Recovering public key with msg ' +
      msg.toString('hex') +
      ' r: ' +
      r.toString(16) +
      ' s: ' +
      s.toString(16),
  )
  const rBuffer = r.toBuffer()
  const sBuffer = s.toBuffer()
  const pubKey = ethUtil.ecrecover(msg, BigInt(v), rBuffer, sBuffer)
  const addrBuf = ethUtil.pubToAddress(pubKey)
  const RecoveredEthAddr = ethUtil.bufferToHex(addrBuf)
  console.log('Recovered ethereum address: ' + RecoveredEthAddr)
  return RecoveredEthAddr
}

export function findRightKey(
  msg: Buffer,
  r: BN,
  s: BN,
  expectedEthAddr: string,
) {
  // This is the wrapper function to find the right v value
  // There are two matching signatues on the elliptic curve
  // we need to find the one that matches to our public key
  // it can be v = 27 or v = 28
  let v = 27
  let pubKey = recoverPubKeyFromSig(msg, r, s, v)
  if (pubKey != expectedEthAddr) {
    // if the pub key for v = 27 does not match
    // it has to be v = 28
    v = 28
    pubKey = recoverPubKeyFromSig(msg, r, s, v)
  }
  console.log('Found the right ETH Address: ' + pubKey + ' v: ' + v)
  return { pubKey, v }
}

export function recoverAddressFromSignature(
  msg: string,
  signature: string,
): string {
  return recover(msg, signature)
}
