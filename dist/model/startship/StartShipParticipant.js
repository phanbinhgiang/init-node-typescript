"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("..");
exports.default = (0, __1.createSchema)({
    id: __1.defaultModelNew.string,
    address: __1.defaultModelNew.sString,
    chain: __1.defaultModelNew.sString,
    register: {
        hash: __1.defaultModelNew.sString,
    },
    sell: {
        hash: [__1.defaultModelNew.string],
        amount: [__1.defaultModelNew.number],
    },
    claim: {
        hash: __1.defaultModelNew.sString,
        amount: __1.defaultModelNew.number,
    },
    hash: __1.defaultModelNew.sString,
}, 'StarshipParticipant', null, null);
//# sourceMappingURL=StartShipParticipant.js.map