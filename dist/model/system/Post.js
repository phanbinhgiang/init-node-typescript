"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("..");
exports.default = (0, __1.createSchema)({
    // Core fields
    slug: __1.defaultModel.stringUnique,
    title: __1.defaultModel.string,
    image: {
        dark: String, light: String, darkColor: String, lightColor: String,
    },
    cover: {
        dark: String, light: String, darkColor: String, lightColor: String,
    },
    description: __1.defaultModel.string,
    content: __1.defaultModel.string,
    note: __1.defaultModel.string,
    displayType: __1.defaultModel.string,
    status: __1.defaultModel.stringStatus,
    publishDate: __1.defaultModel.number,
    blockContent: __1.defaultModel.object,
    // SEO fields
    seoTitle: __1.defaultModel.string,
    seoDescription: __1.defaultModel.string,
    seoKeyword: __1.defaultModel.string,
    seoImage: __1.defaultModel.string,
    seoslug: __1.defaultModel.string,
    altImage: __1.defaultModel.string,
    // Support fields
    relatedID: __1.defaultModel.string,
    isActive: __1.defaultModel.boolean,
    createdAt: __1.defaultModel.date,
    updatedList: __1.defaultModel.array,
    lang: { type: String, default: 'gb' },
    selectedTokens: [
        {
            id: __1.defaultModel.string,
        },
    ],
    universalLink: __1.defaultModel.string,
    // Join from tags collection
    tags: __1.defaultModel.array,
    // Join from user collection
    author: __1.defaultModel.string,
    designer: __1.defaultModel.string,
    // join post difficulty collection
    interactionLevel: __1.defaultModel.string,
    showDisclaimer: __1.defaultModel.boolean,
    // pdf link
    pdfContent: __1.defaultModel.string,
    orgKey: __1.defaultModel.string,
    domain: __1.defaultModel.string,
    // youtube link
    youtubeUrl: __1.defaultModel.string,
    videoDuration: __1.defaultModel.number,
    // background color
    backgroundColor: __1.defaultModel.string,
}, 'Post', null, null);
//# sourceMappingURL=Post.js.map