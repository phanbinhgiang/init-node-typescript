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
/* eslint-disable no-unused-vars */
const web3_1 = __importDefault(require("web3"));
const constants_1 = require("../../common/constants");
class EVMServices {
    static getTxsByHash(chain, hash) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const web3EVM = EVMServices.genWeb3(chain);
                return yield web3EVM.eth.getTransaction(hash);
            }
            catch (error) {
                return false;
            }
        });
    }
    static genWeb3(chain) {
        const filteredByKey = Object.fromEntries(Object.entries(constants_1.CHAIN_DATA).filter(([key, _value]) => key === chain));
        return new web3_1.default(new web3_1.default.providers.HttpProvider(filteredByKey[chain].rpcURL));
    }
}
exports.default = EVMServices;
//# sourceMappingURL=evmService.js.map