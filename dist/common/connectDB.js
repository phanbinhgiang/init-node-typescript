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
    }));
};
exports.connectDatabase = connectDatabase;
exports.default = exports.connectDatabase;
//# sourceMappingURL=connectDB.js.map