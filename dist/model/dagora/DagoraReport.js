"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("..");
exports.default = (0, __1.createSchema)({
    dateStart: __1.defaultModel.date,
    dateEnd: __1.defaultModel.date,
    type: __1.defaultModel.string,
    volumeAddressToken: __1.defaultModel.array,
    totalTransaction: __1.defaultModel.number,
    totalViews: __1.defaultModel.array,
    topViews: __1.defaultModel.array,
    topBuyer: __1.defaultModel.array,
    volumeAll: __1.defaultModel.number,
    volumeChain: __1.defaultModel.array,
    topSeller: __1.defaultModel.array,
    topCollection: __1.defaultModel.array,
    totalTx: __1.defaultModel.number,
    avaPrice: __1.defaultModel.number,
}, 'DagoraReport', null, null);
//# sourceMappingURL=DagoraReport.js.map