/* eslint-disable no-unused-vars */
import Web3 from 'web3';
import { CHAIN_DATA } from '../../common/constants';

export default class EVMServices {
  static async getTxsByHash(chain, hash) {
    try {
      const web3EVM = EVMServices.genWeb3(chain);
      return await web3EVM.eth.getTransaction(hash);
    } catch (error) {
      return false;
    }
  }

  static genWeb3(chain) {
    const filteredByKey: any = Object.fromEntries(
      Object.entries(CHAIN_DATA).filter(([key, _value]) => key === chain),
    );
    return new Web3(new Web3.providers.HttpProvider(filteredByKey[chain].rpcURL));
  }
}
