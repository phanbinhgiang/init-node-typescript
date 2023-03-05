"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("..");
exports.default = (0, __1.createSchema)({
    slug: __1.defaultModel.stringUnique,
    title: __1.defaultModel.string,
    description: __1.defaultModel.string,
    descriptionMobile: __1.defaultModel.string,
    logo: __1.defaultModel.string,
    banner: __1.defaultModel.array,
    bannerMobile: __1.defaultModel.array,
    url: __1.defaultModel.string,
    genre: __1.defaultModel.array,
    cgkId: __1.defaultModel.string,
    chain: __1.defaultModel.array,
    isPinned: __1.defaultModel.booleanFalse,
    weight: __1.defaultModel.number,
    tags: __1.defaultModel.array,
    social: __1.defaultModel.object,
    isActive: __1.defaultModel.boolean,
}, 'Dapps', null, null);
//# sourceMappingURL=Dapps.js.map