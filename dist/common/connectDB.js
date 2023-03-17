"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDatabase = void 0;
/* eslint-disable consistent-return */
/* eslint-disable array-callback-return */
/* eslint-disable max-len */
const mongoose_1 = __importDefault(require("mongoose"));
const bluebird_1 = __importDefault(require("bluebird"));
// import { BorshCoder } from '@project-serum/anchor';
// import { PublicKey } from '@solana/web3.js';
// import Dagora from '../ABI/dagora_marketplace.json';
// import { connectionSolana } from './solanaService';
// import Interaction from '../model/interaction/Interaction';
const connectDatabase = () => {
    mongoose_1.default.Promise = bluebird_1.default;
    mongoose_1.default.set('strictQuery', true);
    mongoose_1.default.connect(`mongodb://${process.env.DB_URL}/${process.env.DB_NAME}`).then(() => __awaiter(void 0, void 0, void 0, function* () {
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
    }));
};
exports.connectDatabase = connectDatabase;
exports.default = exports.connectDatabase;
//# sourceMappingURL=connectDB.js.map