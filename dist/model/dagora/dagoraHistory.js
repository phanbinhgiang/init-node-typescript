"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("..");
exports.default = (0, __1.createSchema)({
    hash: __1.defaultModel.string,
    // nft data
    address: __1.defaultModel.string,
    chain: __1.defaultModel.string,
    id: __1.defaultModel.string,
    name: __1.defaultModel.string,
    image: __1.defaultModel.string,
    from: __1.defaultModel.string,
    owner: __1.defaultModel.string,
    // history type
    type: __1.defaultModel.string,
    // token data
    amount: __1.defaultModel.number,
    tokenAddress: __1.defaultModel.string,
    price: __1.defaultModel.number,
    block: __1.defaultModel.number,
    // auction Field need to check active auction
    isActive: __1.defaultModel.boolean, // check status auction
    // eslint-disable-next-line object-curly-newline
}, 'DagoraHistory', null, { field: { hash: 1, chain: 1, address: 1, id: 1 }, options: { unique: true } });
//# sourceMappingURL=dagoraHistory.js.map