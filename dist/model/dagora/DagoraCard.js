"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("..");
exports.default = (0, __1.createSchema)({
    address: __1.defaultModel.string,
    name: __1.defaultModel.string,
    genre: __1.defaultModel.array,
    image: __1.defaultModel.string,
    chain: __1.defaultModel.string,
    tokenAddress: __1.defaultModel.string,
    amount: __1.defaultModel.string,
    isActive: __1.defaultModel.boolean,
    type: __1.defaultModel.string,
    description: __1.defaultModel.string,
}, 'DagoraCard', null, null);
//# sourceMappingURL=DagoraCard.js.map