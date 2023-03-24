"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("..");
exports.default = (0, __1.createSchema)({
    time: __1.defaultModel.number,
    id: __1.defaultModel.stringUnique,
    data: __1.defaultModel.string,
    array: __1.defaultModel.array,
    object: __1.defaultModel.object,
}, 'CacheData', null, null);
//# sourceMappingURL=CacheData.js.map