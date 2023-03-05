"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dappFilter = exports.lookupDapps = exports.dappsInteractionType = void 0;
exports.dappsInteractionType = {
    genre: 'genre',
    dapps: 'dapps',
    openDapp: 'openDapp',
};
exports.lookupDapps = {
    from: 'dapps',
    let: { dappsId: '$_id' },
    pipeline: [
        { $match: { $expr: { $eq: [{ $toString: '$_id' }, '$$dappsId'] } } },
        { $limit: 1 },
        {
            $project: {
                _id: 1,
                logo: 1,
                banner: 1,
                bannerMobile: 1,
                url: 1,
                slug: 1,
                title: 1,
                description: 1,
                chain: 1,
            },
        },
    ],
    as: 'dapps',
};
exports.dappFilter = {
    _id: 1,
    social: 1,
    slug: 1,
    title: 1,
    description: 1,
    descriptionMobile: 1,
    logo: 1,
    banner: 1,
    url: 1,
    genre: 1,
    chain: 1,
    weight: 1,
    tags: 1,
    isPinned: 1,
    bannerMobile: 1,
};
//# sourceMappingURL=constant.js.map