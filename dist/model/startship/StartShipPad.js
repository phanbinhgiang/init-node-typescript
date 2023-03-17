"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("..");
exports.default = (0, __1.createSchema)({
    slug: __1.defaultModelNew.stringUnique,
    hash: { type: String },
    chainId: { type: String, required: true },
    information: {
        banner: __1.defaultModelNew.sString,
        logo: __1.defaultModelNew.sString,
        name: __1.defaultModelNew.sString,
        description: __1.defaultModelNew.sString,
    },
    content: __1.defaultModelNew.sString,
    token0: {
        address: { type: String, required: true },
        price: __1.defaultModelNew.number,
    },
    token1: {
        address: { type: String, required: true },
        price: __1.defaultModelNew.number,
    },
    contract: {
        id: __1.defaultModelNew.sString,
        address: __1.defaultModelNew.sString,
        owner: __1.defaultModelNew.sString,
        signer: __1.defaultModelNew.sString,
        privateSignature: __1.defaultModelNew.sString,
        limitToken: __1.defaultModelNew.number,
        limitPerUser: __1.defaultModelNew.number,
    },
    date: {
        regStart: __1.defaultModelNew.number,
        regEnd: __1.defaultModelNew.number,
        sellStart: __1.defaultModelNew.number,
        sellEnd: __1.defaultModelNew.number,
        claimStart: __1.defaultModelNew.number,
        claimEnd: __1.defaultModelNew.number,
    },
    status: __1.defaultModelNew.sObject,
    social: __1.defaultModelNew.sObject,
    isPrivate: __1.defaultModelNew.booleanFalse,
    whitelist: __1.defaultModelNew.sString,
    isActive: __1.defaultModelNew.boolean,
}, 'StarshipPad', null, null);
//# sourceMappingURL=StartShipPad.js.map