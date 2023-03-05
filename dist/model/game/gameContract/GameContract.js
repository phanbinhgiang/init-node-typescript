"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("..");
exports.default = (0, __1.createSchema)({
    id: __1.defaultModel.stringUnique,
    values: __1.defaultModel.object,
    owner: __1.defaultModel.string,
    pointCheck: __1.defaultModel.booleanFalse,
    isVerify: __1.defaultModel.booleanFalse,
}, 'GameContract', null, null);
//# sourceMappingURL=GameContract.js.map