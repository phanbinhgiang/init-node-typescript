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
    // const Txs: any = await connectionSolana.getParsedTransaction('43Bj5eQH95VqCeeaEDCMCYswecZnShGAZrZQx7D6wgA4xaVzUP94DefTrRBbLENjKGvaURbtgdjhhJg4UBA9FgYt', 'finalized');
    // console.log('🚀 ~ file: connectDB.ts:20 ~ mongoose.connect ~ Txs:', Txs.transaction.message.instructions);
    // // data: 'CpB3PTm2PoUZb5cRz6dyS5VhdSYpqPWVCFDPD6cVWhpvwnTsSD8hbHYvQufNcas'
    // // data: 'BZYjjsFJauNoBR8ekERU4wrYpHH1iLtjD9RnDrCzaHggFnQCztQvzr4'
    // // data: '7iTEd7e3EbweCtsoYFTtSx5c3TtxvCSTEYrakEAxmHoEkBJC5qWWtGsiX4HvCPYv81ZaqhL2fMMmXXehGWrVtGN5ECNiNoLDqmeAkdbj6WHGeQiKeZmJG3qRS73bJGGjCpF5c8QAmdsLhuYEhnAs

    // const decodeData = coder.instruction.decode('8AN3FhhquV7ZsBRi5mceSo7pYV7cJ9wtxgLmhRQQYQ7Cp3mewroApb', 'base58');
    // console.log('🚀 ~ file: connectDB.ts:26 ~ mongoose.connect ~ decodeData:', decodeData);
    // // const { instructions } = Txs.transaction.message;
    // // const listDecodeData = instructions.map((item) => {
    // //   if (item.programId.toString() === 'GbxbAey4BhU3qmvivfCd33zwqfpnWrD6Jvi6eEGLL2iE') {
    // //     const decodeData = coder.instruction.decode(item.data, 'base58');
    // //     return decodeData.data;
    // //   }
    // // }).filter((item) => item);

    // // console.log(listDecodeData);
  });
};

export default connectDatabase;
