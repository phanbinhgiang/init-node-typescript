"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("..");
exports.default = (0, __1.createSchema)({
    id: __1.defaultModel.string,
    type: __1.defaultModel.string,
    reUpdatedList: __1.defaultModel.array,
    relatedID: __1.defaultModel.array,
    isActive: __1.defaultModel.boolean,
    locale: __1.defaultModel.string,
    orgID: __1.defaultModel.string,
    info: __1.defaultModel.object,
    theme: __1.defaultModel.object,
    font: __1.defaultModel.object,
}, 'Interaction', null, null);
//# sourceMappingURL=Interaction.js.map