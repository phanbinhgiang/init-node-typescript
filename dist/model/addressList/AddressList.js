"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("..");
exports.default = (0, __1.createSchema)({
    id: __1.defaultModel.string,
    chain: __1.defaultModel.string,
    numCreated: __1.defaultModel.number,
    lastCreated: __1.defaultModel.date,
    source: __1.defaultModel.string,
    createdUser: __1.defaultModel.array,
}, 'AddressList', null, null);
//# sourceMappingURL=AddressList.js.map