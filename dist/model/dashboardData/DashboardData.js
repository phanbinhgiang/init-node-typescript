"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("..");
exports.default = (0, __1.createSchema)({
    id: __1.defaultModel.stringUnique,
    interval: __1.defaultModel.string,
    startAt: __1.defaultModel.date,
    endAt: __1.defaultModel.date,
    addressNew: __1.defaultModel.number,
    addressSummary: __1.defaultModel.object,
    addressTotal: __1.defaultModel.number,
    pointNew: __1.defaultModel.number,
    pointTotal: __1.defaultModel.number,
    swapCount: __1.defaultModel.number,
    swapCountSummary: __1.defaultModel.object,
    swapCountTotal: __1.defaultModel.number,
    swapVolume: __1.defaultModel.number,
    swapVolumeSummary: __1.defaultModel.object,
    swapVolumeTotal: __1.defaultModel.number,
    transactionCount: __1.defaultModel.number,
    transactionCountSummary: __1.defaultModel.object,
    transactionCountTotal: __1.defaultModel.number,
    transactionVolume: __1.defaultModel.number,
    transactionVolumeSummary: __1.defaultModel.object,
    transactionVolumeTotal: __1.defaultModel.number,
    userActive: __1.defaultModel.number,
    userAccountActive: __1.defaultModel.number,
    userNew: __1.defaultModel.number,
    userTotal: __1.defaultModel.number,
    userTempActive: __1.defaultModel.number,
    userTempNew: __1.defaultModel.number,
    userTempTotal: __1.defaultModel.number,
}, 'DashboardData', null, null);
//# sourceMappingURL=DashboardData.js.map