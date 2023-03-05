"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("..");
exports.default = (0, __1.createSchema)({
    id: __1.defaultModel.string,
    ids: __1.defaultModel.array,
    user: __1.defaultModel.string,
    address: __1.defaultModel.string,
    owner: __1.defaultModel.string,
    pointOwner: { type: String },
    historyOwner: __1.defaultModel.object,
    point: __1.defaultModel.number,
    pointCheck: __1.defaultModel.booleanFalse,
    isVerify: __1.defaultModel.booleanFalse,
}, 'GameNFTs', null, null);
//# sourceMappingURL=GameNFTs.js.map