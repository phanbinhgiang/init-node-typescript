"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("..");
exports.default = (0, __1.createSchema)({
    id: __1.defaultModel.string,
    fatherId: __1.defaultModel.string,
    content: __1.defaultModel.string,
    author: __1.defaultModel.string,
    image: __1.defaultModel.string,
    isActive: __1.defaultModel.boolean,
}, 'knowledgeComment', null, null);
//# sourceMappingURL=knowledgeComment.js.map