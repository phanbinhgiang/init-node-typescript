"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("..");
exports.default = (0, __1.createSchema)({
    // Applicant ID and href
    id: __1.defaultModel.string,
    txReceipt: __1.defaultModel.object,
    amount: __1.defaultModel.number,
    hash: __1.defaultModel.string,
    applicant: __1.defaultModel.string,
    country: __1.defaultModel.string,
    responseSubmit: __1.defaultModel.object,
    responseReport: __1.defaultModel.array,
    responseChecks: __1.defaultModel.object,
    submitTime: __1.defaultModel.number,
    firstName: __1.defaultModel.string,
    lastName: __1.defaultModel.string,
    dob: __1.defaultModel.string,
    createdUser: __1.defaultModel.string,
    address: __1.defaultModel.object,
    status: { type: String, default: 'inProgress' },
    token: __1.defaultModel.string,
    tokenTime: __1.defaultModel.number,
    startDate: __1.defaultModel.number,
    lastTimeCall: __1.defaultModel.number,
}, 'KYCVerify', null, null);
//# sourceMappingURL=KYCVerify.js.map