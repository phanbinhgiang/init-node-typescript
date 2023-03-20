"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("..");
exports.default = (0, __1.createSchema)({
    time: __1.defaultModel.number,
    id: __1.defaultModel.stringUnique,
    data: __1.defaultModel.object,
}, 'RecordCacheData', null, null);
//# sourceMappingURL=RecordCacheData.js.map