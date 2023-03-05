"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("..");
exports.default = (0, __1.createSchema)({
    id: __1.defaultModel.stringUnique,
    title: __1.defaultModel.string,
    author: __1.defaultModel.string,
    category: [
        {
            title: __1.defaultModel.string,
        },
    ],
    image: __1.defaultModel.string,
    description: __1.defaultModel.string,
    isActive: __1.defaultModel.boolean,
}, 'knowledgeTopic', null, null);
//# sourceMappingURL=KnowledgeTopic.js.map