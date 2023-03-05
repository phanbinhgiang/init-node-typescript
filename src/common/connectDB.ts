/* eslint-disable consistent-return */
/* eslint-disable array-callback-return */
/* eslint-disable max-len */
import mongoose from 'mongoose';
import bluebird from 'bluebird';
// import { BorshCoder } from '@project-serum/anchor';
// import { PublicKey } from '@solana/web3.js';
// import Dagora from '../ABI/dagora_marketplace.json';
// import { connectionSolana } from './solanaService';
// import Interaction from '../model/interaction/Interaction';

export const connectDatabase = () => {
  mongoose.Promise = bluebird;
  mongoose.set('strictQuery', true);
  mongoose.connect(`mongodb://${process.env.DB_URL}/${process.env.DB_NAME}`).then(async () => {
    // const DagoraIDL: any = Dagora;
    // const coder = new BorshCoder(DagoraIDL);
    // console.log({ coder });
    // const Txs: any = await connectionSolana.getParsedTransaction('3QD5it5auR4VL42LE5VfkpUsohxzkJZGcukvJ2xK3vEuuvoR3Q8e7vQcWXqhUpAW1tsLbhtoG4MTi3Q23g8i85jm');
    // const { instructions } = Txs.transaction.message;
    // const listDecodeData = instructions.map((item) => {
    //   if (item.programId.toString() === 'GbxbAey4BhU3qmvivfCd33zwqfpnWrD6Jvi6eEGLL2iE') {
    //     const decodeData = coder.instruction.decode(item.data, 'base58');
    //     return decodeData.data;
    //   }
    // }).filter((item) => item);

    // console.log(listDecodeData);
    // console.log(new PublicKey('8EBFWrHMrqfFwEnNLmERag6NhBwXJ4yxauUnLMNU2ZQH'));
  });
};

export default connectDatabase;
