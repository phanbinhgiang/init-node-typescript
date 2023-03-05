"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("..");
exports.default = (0, __1.createSchema)({
    slug: __1.defaultModel.stringUnique,
    title: __1.defaultModel.string,
    description: __1.defaultModel.string,
    logo: __1.defaultModel.string,
    banner: __1.defaultModel.array,
    isPinned: __1.defaultModel.booleanFalse,
    weight: __1.defaultModel.number,
    tags: __1.defaultModel.array,
    isActive: __1.defaultModel.boolean,
    createdUser: __1.defaultModel.string,
    source: __1.defaultModel.string,
}, 'Genre', null, null);
//# sourceMappingURL=Genre.js.map