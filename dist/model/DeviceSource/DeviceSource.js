"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("..");
exports.default = (0, __1.createSchema)({
    id: __1.defaultModel.stringUnique,
    createdUser: __1.defaultModel.array,
    lastSync: __1.defaultModel.date,
    numSync: __1.defaultModel.number,
    source: __1.defaultModel.string,
    os: __1.defaultModel.string,
    isActive: __1.defaultModel.boolean,
}, 'DeviceSource', null, null);
//# sourceMappingURL=DeviceSource.js.map