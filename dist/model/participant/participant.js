"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("..");
exports.default = (0, __1.createSchema)({
    id: __1.defaultModel.stringUnique,
    campaign: __1.defaultModel.string,
    user: __1.defaultModel.string,
    token: __1.defaultModel.string,
    signature: __1.defaultModel.string,
    lang: __1.defaultModel.string,
}, 'Participant', null, null);
//# sourceMappingURL=participant.js.map