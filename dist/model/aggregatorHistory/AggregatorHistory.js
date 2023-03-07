"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("..");
exports.default = (0, __1.createSchema)({
    id: __1.defaultModel.stringUnique,
    hash: __1.defaultModel.string,
    block: __1.defaultModel.number,
    partner: __1.defaultModel.string,
    partnerId: __1.defaultModel.string,
    numChecked: __1.defaultModel.number,
    status: __1.defaultModel.booleanFalse,
    isVerify: __1.defaultModel.booleanFalse,
    impact: __1.defaultModel.number,
    slippage: __1.defaultModel.number,
    fee: __1.defaultModel.number,
    gasLimit: __1.defaultModel.number,
    gasPrice: __1.defaultModel.number,
    source: __1.defaultModel.string,
    volume: __1.defaultModel.number,
    // symbol, address, decimals
    token0: __1.defaultModel.object,
    token1: __1.defaultModel.object,
    token0Rate: __1.defaultModel.number,
    token1Rate: __1.defaultModel.number,
    chain: __1.defaultModel.string,
    inputAmount: __1.defaultModel.number,
    outputAmount: __1.defaultModel.number,
    from: __1.defaultModel.string,
    createdUser: __1.defaultModel.string,
    factory: __1.defaultModel.array,
    isActive: __1.defaultModel.boolean,
}, 'AggregatorHistory', null, null);
//# sourceMappingURL=AggregatorHistory.js.map