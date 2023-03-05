"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("../../..");
exports.default = (0, __1.createSchema)({
    id: __1.defaultModel.stringUnique,
    volume: __1.defaultModel.number,
    amount: __1.defaultModel.number,
    previousAmount: __1.defaultModel.number,
    bonusValue: __1.defaultModel.object,
    percent: __1.defaultModel.number,
    type: { type: String, default: 'trade' },
    fromUser: __1.defaultModel.string,
    createdUser: __1.defaultModel.string,
}, 'PointUser', null, null);
//# sourceMappingURL=PointUser.js.map