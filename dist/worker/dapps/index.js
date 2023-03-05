"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable consistent-return */
/* eslint-disable prefer-spread */
/* eslint-disable default-param-last */
/* eslint-disable no-param-reassign */
/* eslint-disable no-underscore-dangle */
/* eslint-disable max-len */
const moment_1 = __importDefault(require("moment"));
const random_1 = __importDefault(require("lodash/random"));
const function_1 = require("../function");
// import { Dapps, Genre } from '../../../model'
const Dapps_1 = __importDefault(require("../../model/dapps/Dapps"));
const Genre_1 = __importDefault(require("../../model/dapps/Genre"));
const dappsInteraction_1 = __importDefault(require("./dappsInteraction"));
const constant_1 = require("./constant");
const Interaction_1 = __importDefault(require("../../model/interaction/Interaction"));
class DappWorker {
    static getHome(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { chain } = req.query;
            const key = `DAPP_BROWER_HOME_V2${(0, function_1.getLength)(chain) > 0 ? chain : ''}`;
            dappsInteraction_1.default.addViewWithUserLocal('homeView', '');
            (0, function_1.fetchCacheRedis)(key, req, next, 5 * 60 * 1000, () => __awaiter(this, void 0, void 0, function* () {
                const arrGenre = yield Genre_1.default.find({ isActive: true, $or: [{ source: '' }, { source: { $exists: false } }] }, { slug: 1, title: 1 }).sort({ weight: -1 });
                const finalData = yield Promise.all(arrGenre.map((it) => __awaiter(this, void 0, void 0, function* () {
                    const dappsPayload = yield DappWorker.getTopViewDappOfGenreLocal(it._id.toString(), chain, 1, 15);
                    return {
                        genre: it,
                        dapps: dappsPayload,
                    };
                })));
                return finalData;
            }));
        });
    }
    static getHomeSide(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { page = 1, size = 15, chain } = req.query;
            const key = `DAPP_BROWER_HOME_ADDITIONAL_${page}_${size}_${chain}`;
            (0, function_1.fetchCacheRedis)(key, req, next, 5 * 60 * 1000, () => __awaiter(this, void 0, void 0, function* () {
                const matchState = { isActive: true };
                if ((0, function_1.getLength)(chain) > 0) {
                    matchState.chain = chain;
                }
                const pinndedMatchState = Object.assign({ isPinned: true }, matchState);
                const arrDapp = yield Dapps_1.default.find(matchState, constant_1.dappFilter).lean();
                const pinnedDapps = yield Dapps_1.default.find(pinndedMatchState, constant_1.dappFilter).sort({ weight: -1 }).limit(parseInt(size)).lean();
                // get view of all data
                const arrViewTrending = yield dappsInteraction_1.default.getViewOfIdLocal(arrDapp.map((it) => it._id), null, (0, moment_1.default)().subtract(1, 'day').toDate());
                const arrViewAll = yield dappsInteraction_1.default.getViewOfIdLocal(arrDapp.map((it) => it._id), null);
                const arrViewOfPinned = yield dappsInteraction_1.default.getViewOfIdLocal(pinnedDapps.map((it) => it._id));
                // migrate view to dapps
                const arrDappTrending = DappWorker.migrateViewToArrDappLocal(arrDapp, arrViewTrending).sort((a, b) => b.view - a.view).slice((parseInt(page) - 1) * parseInt(size), parseInt(page) * parseInt(size));
                // migrate view all top trending dapp
                const arrDappsTrendingAllTimeView = DappWorker.migrateViewToArrDappLocal(arrDappTrending, arrViewAll);
                // sort view Data
                const arrDappPopular = DappWorker.migrateViewToArrDappLocal(arrDapp, arrViewAll).sort((a, b) => b.view - a.view).slice((parseInt(page) - 1) * parseInt(size), parseInt(page) * parseInt(size));
                const formatViewPinned = DappWorker.migrateViewToArrDappLocal(pinnedDapps, arrViewOfPinned);
                return { trendingDapps: arrDappsTrendingAllTimeView, popularDapps: arrDappPopular, pinnedDapps: formatViewPinned };
            }));
        });
    }
    static migrateViewToArrDappLocal(arrDapp, arrView) {
        const formatViewPinned = arrDapp.map((it) => {
            delete it.view;
            const foundView = arrView.find((view) => view._id === it._id.toString());
            return Object.assign({ view: foundView ? foundView.view : 0 }, it);
        });
        return formatViewPinned;
    }
    static getDappsOfgenreLocal(genre, chain, size = 15, ninSlug) {
        return __awaiter(this, void 0, void 0, function* () {
            const matchState = {};
            if ((0, function_1.getLength)(chain) > 0) {
                matchState.chain = chain;
            }
            if ((0, function_1.getLength)(genre) > 0) {
                matchState.genre = genre;
            }
            if ((0, function_1.getLength)(ninSlug) > 0) {
                matchState.slug = { $nin: ninSlug };
            }
            const payload = yield Dapps_1.default.find(matchState, constant_1.dappFilter).sort({ weight: -1 }).limit(parseInt(size)).lean();
            const arrView = yield dappsInteraction_1.default.getViewOfIdLocal(payload.map((it) => it._id));
            return payload.map((it) => {
                const foundView = arrView.find((view) => view._id === it._id.toString());
                return Object.assign({ view: foundView ? foundView.view : 0 }, it);
            });
        });
    }
    static getRecomendDapps(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { page = 1, size = 10, chain } = req.query;
            const { user } = req;
            const dappMatchState = {
                isActive: true,
            };
            const key = `DAPP_BROWER_HOME_ADDITIONAL_${1}_${15}_${chain}`;
            const storeData = yield (0, function_1.getStorage)(key);
            const arrSideDapps = (storeData && storeData.data) ? [].concat(storeData.data.trendingDapps, storeData.data.popularDapps, storeData.data.pinnedDapps) : [];
            const arrNotRecommend = arrSideDapps.map((it) => it.slug);
            if ((0, function_1.getLength)(chain) > 0) {
                dappMatchState.chain = chain;
            }
            const payloadInteraction = yield dappsInteraction_1.default.getUserDappsLocal(user);
            dappMatchState.slug = { $nin: arrNotRecommend };
            const arrDappsFilter = yield Dapps_1.default.find(Object.assign({ _id: { $in: payloadInteraction.map((it) => it._id) } }, dappMatchState)).lean();
            const isMissingData = (0, function_1.getLength)(arrDappsFilter) < parseInt(page) * parseInt(size);
            const arrSlug = arrDappsFilter.map((it) => it._id);
            if (isMissingData) {
                const missingSize = parseInt(page) * parseInt(size) - (0, function_1.getLength)(arrSlug);
                if (missingSize >= parseInt(size)) {
                    const payloadDapps = yield Dapps_1.default.find(Object.assign({ _id: { $nin: arrSlug } }, dappMatchState), constant_1.dappFilter).sort({ weight: -1 }).skip(missingSize - parseInt(size)).limit(parseInt(size))
                        .lean();
                    const arrview = yield dappsInteraction_1.default.getViewOfIdLocal(payloadDapps.map((it) => it._id));
                    req.response = DappWorker.migrateViewToArrDappLocal(payloadDapps, arrview);
                    return next();
                }
                const payloadDapps = yield Dapps_1.default.find(Object.assign({ _id: { $nin: arrSlug } }, dappMatchState), constant_1.dappFilter).sort({ weight: -1 }).limit(parseInt(missingSize)).lean();
                const finalDapp = arrDappsFilter.slice((parseInt(page) - 1) * parseInt(size), parseInt(page) * parseInt(size)).concat(payloadDapps);
                const arrview = yield dappsInteraction_1.default.getViewOfIdLocal(finalDapp.map((it) => it._id));
                req.response = DappWorker.migrateViewToArrDappLocal(finalDapp, arrview);
                return next();
            }
            const payloadDappsView = arrDappsFilter.slice((parseInt(page) - 1) * parseInt(size), parseInt(page) * parseInt(size));
            const arrview = yield dappsInteraction_1.default.getViewOfIdLocal(payloadDappsView.map((it) => it._id));
            req.response = DappWorker.migrateViewToArrDappLocal(payloadDappsView, arrview);
            return next();
        });
    }
    static getSuggestBySlug(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const findDapp = yield Dapps_1.default.findOne({ slug: req.params.slug }, { genre: 1, chain: 1 }).lean();
            if (!findDapp)
                return next();
            const totalSuggestDapp = yield Dapps_1.default.countDocuments({
                slug: { $ne: req.params.slug },
                $or: [{ genre: { $in: findDapp.genre } }, { chain: findDapp.chain }],
            });
            req.response = yield Dapps_1.default.findOne({
                slug: { $ne: req.params.slug },
                $or: [{ genre: { $in: findDapp.genre } }, { chain: findDapp.chain }],
            }, constant_1.dappFilter).skip(Math.floor((0, random_1.default)(totalSuggestDapp)));
            return next();
        });
    }
    static getBySlug(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const findDapp = yield Dapps_1.default.findOne({ slug: req.params.slug }, constant_1.dappFilter).lean();
            if (!findDapp)
                return next();
            const dappsCategory = yield Genre_1.default.find({ _id: { $in: findDapp.genre } }, { slug: 1, title: 1 });
            dappsInteraction_1.default.addViewWithUserLocal(findDapp.slug, req.user);
            delete findDapp._id;
            const finalDappData = Object.assign(findDapp, { genre: dappsCategory });
            req.response = finalDappData;
            return next();
        });
    }
    static getFilterDapps(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { isPinned, page = 1, size = 5, chain, category, keyword, } = req.query;
            const findState = { isActive: true };
            if ((0, function_1.getLength)(category) > 0) {
                const filterSlug = category.split(',');
                const findGenre = yield Genre_1.default.find({ slug: { $in: filterSlug } }, { _id: 1 });
                if ((0, function_1.getLength)(findGenre) === 0) {
                    req.response = [];
                    return next();
                }
                findState.genre = { $in: findGenre.map((it) => it._id.toString()) };
            }
            if ((0, function_1.getLength)(chain) > 0) {
                findState.chain = chain;
            }
            if (isPinned === 'true') {
                findState.isPinned = true;
            }
            if ((0, function_1.getLength)(keyword)) {
                findState.title = { $regex: keyword, $options: 'i' };
            }
            const payload = yield Dapps_1.default.find(findState, constant_1.dappFilter).sort({ weight: -1, _id: 1 }).skip((0, function_1.genSkipNum)(page, size)).limit(parseInt(size))
                .lean();
            const arrview = yield dappsInteraction_1.default.getViewOfIdLocal(payload.map((it) => it._id));
            req.response = DappWorker.migrateViewToArrDappLocal(payload, arrview);
            return next();
        });
    }
    static getFilterTopViewDapp(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { isPinned, page = 1, size = 5, chain, category, keyword, } = req.query;
            const findState = { isActive: true };
            if ((0, function_1.getLength)(category) > 0) {
                const filterSlug = category.split(',');
                const findGenre = yield Genre_1.default.find({ slug: { $in: filterSlug } }, { _id: 1 });
                if ((0, function_1.getLength)(findGenre) === 0) {
                    req.response = [];
                    return next();
                }
                findState.genre = { $in: findGenre.map((it) => it._id.toString()) };
            }
            if ((0, function_1.getLength)(chain) > 0) {
                findState.chain = chain;
            }
            if (isPinned === 'true') {
                findState.isPinned = true;
            }
            if ((0, function_1.getLength)(keyword)) {
                findState.title = { $regex: keyword, $options: 'i' };
            }
            const payload = yield Dapps_1.default.find(findState, constant_1.dappFilter).lean();
            const arrview = yield dappsInteraction_1.default.getViewOfIdLocal(payload.map((it) => it._id));
            req.response = DappWorker.migrateViewToArrDappLocal(payload, arrview).sort((a, b) => b.view - a.view).slice((0, function_1.genSkipNum)(page, size), parseInt(page) * parseInt(size));
            return next();
        });
    }
    static getHomeByChain(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { chain } = req.params;
            const page = 1;
            const size = 10;
            // DappsInteractionWorker.addViewWithUserLocal('homeView', '')
            const key = `DAPP_HOME_BY_CHAIN_${chain}`;
            (0, function_1.fetchCacheRedis)(key, req, next, 5 * 60 * 1000, () => __awaiter(this, void 0, void 0, function* () {
                const totalGenre = yield Dapps_1.default.aggregate([
                    {
                        $match: {
                            chain,
                            $or: [{ source: '' }, { source: { $exists: false } }],
                        },
                    },
                    {
                        $group: {
                            _id: '$genre',
                        },
                    },
                ]);
                const mapGenre = ([].concat.apply([], totalGenre.map((gr) => gr._id))).filter(function_1.onlyUnique);
                const findGenre = yield Genre_1.default.find({ _id: { $in: mapGenre }, isActive: true }, { _id: 1, slug: 1, title: 1 }).sort({ weight: -1 }).lean();
                const finalData = yield Promise.all(findGenre.map((it) => __awaiter(this, void 0, void 0, function* () {
                    const dappData = yield DappWorker.getTopViewDappOfGenreLocal(it._id.toString(), chain, page, size);
                    return {
                        genre: it,
                        dapps: dappData,
                    };
                })));
                return finalData;
            }));
        });
    }
    static getFilterTopviewByCategory(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { page = 1, size = 5, category, chain, } = req.query;
            const filterSlug = category.split(',');
            const findGenre = yield Genre_1.default.find({ slug: { $in: filterSlug }, isActive: true }, { _id: 1, slug: 1, title: 1 }).lean();
            if ((0, function_1.getLength)(findGenre) === 0) {
                req.response = [];
                return next();
            }
            const finalData = yield Promise.all(findGenre.map((it) => __awaiter(this, void 0, void 0, function* () {
                const dappData = yield DappWorker.getTopViewDappOfGenreLocal(it._id.toString(), chain, page, size);
                return {
                    genre: it,
                    dapps: dappData,
                };
            })));
            req.response = finalData;
            return next();
        });
    }
    static getTopViewDappOfGenreLocal(genreId, chain, page = 1, size = 10) {
        return __awaiter(this, void 0, void 0, function* () {
            const dappMatchState = { genre: genreId };
            if ((0, function_1.getLength)(chain) > 0) {
                dappMatchState.chain = chain;
            }
            const dappsPayload = yield Dapps_1.default.find(dappMatchState, constant_1.dappFilter).lean();
            const arrView = yield dappsInteraction_1.default.getViewOfIdLocal(dappsPayload.map((it) => it._id));
            const finalData = DappWorker.migrateViewToArrDappLocal(dappsPayload, arrView).sort((a, b) => b.view - a.view).slice((0, function_1.genSkipNum)(page, size), parseInt(page) * parseInt(size));
            return finalData;
        });
    }
    static getDappsByIdLocal(slug) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const payload = yield Dapps_1.default.findOne({ slug, isActive: true }, constant_1.dappFilter);
                return payload;
            }
            catch (err) {
                return false;
            }
        });
    }
    // Admin Data
    static putPin(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const findData = yield Dapps_1.default.findOne({ _id: req.params.id }, { isPinned: 1 });
            if (!findData)
                return next();
            yield findData.updateOne({ isPinned: !findData.isPinned });
            req.response = true;
            return next();
        });
    }
    static getAdmin(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { genre, isPinned, status, page, size, chain, } = req.query;
            const findState = { isActive: status === 'true' };
            if (genre) {
                const findGenre = yield Genre_1.default.findOne({ slug: genre }, { _id: 1 });
                if (!findGenre)
                    return next();
                findState.genre = findGenre._id;
            }
            if (chain) {
                findState.chain = chain;
            }
            if (isPinned === 'true') {
                findState.isPinned = true;
            }
            const payload = yield Dapps_1.default.find(findState, constant_1.dappFilter).sort({ weight: -1 }).skip((0, function_1.genSkipNum)(page, size)).limit(parseInt(size));
            req.response = payload;
            return next();
        });
    }
    static postDapps(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { title, description, descriptionMobile, logo, banner = [], url, genre, chain, weight = 0, tags = [], bannerMobile, social, } = req.body;
            if ((0, function_1.getLength)(title === 0) || (0, function_1.getLength)(logo === 0)) {
                req.response = { errMess: 'titleNull' };
                return next();
            }
            if ((yield Dapps_1.default.countDocuments({ slug: (0, function_1.createSlug)(title) })) > 0) {
                req.response = { errMess: 'titleExists' };
                return next();
            }
            if ((yield Genre_1.default.countDocuments({ _id: { $in: genre } })) === 0) {
                req.response = { errMess: 'genreNull' };
                return next();
            }
            yield Dapps_1.default.create({
                slug: (0, function_1.createSlug)(title),
                title,
                descriptionMobile,
                description,
                logo,
                banner,
                url,
                genre,
                chain,
                weight,
                tags,
                bannerMobile: bannerMobile || banner[0],
                social,
            });
            req.response = true;
            next();
        });
    }
    static putDapps(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const findData = yield Dapps_1.default.findOne({ _id: req.body.id }, { _id: 1 });
            if (!findData)
                return next();
            const stateUpdate = (0, function_1.genUpdate)(req.body, ['title', 'descriptionMobile', 'description', 'logo', 'url', 'genre', 'chain', 'banner', 'weight', 'tags', 'bannerMobile', 'social']);
            if (stateUpdate.title) {
                stateUpdate.slug = (0, function_1.createSlug)(stateUpdate.title);
            }
            if (stateUpdate.genre) {
                if ((yield Genre_1.default.countDocuments({ _id: stateUpdate.genre })) === 0)
                    return next();
            }
            yield findData.updateOne(stateUpdate);
            req.response = true;
            return next();
        });
    }
    static deleteDapps(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const findGenre = yield Dapps_1.default.findOne({ _id: req.params.id }, { isActive: 1, _id: 1 });
            if (!findGenre)
                return next();
            yield findGenre.updateOne({ isActive: !findGenre.isActive, slug: `DELETE_DAPP_${Date.now()}` });
            req.response = true;
            return next();
        });
    }
    // Interaction Report
    static getInteractionReport(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const pinnedDapps = yield Dapps_1.default.find({ isPinned: true }, { _id: 1 });
            const allViewCount = yield Interaction_1.default.aggregate([
                {
                    $match: {
                        type: constant_1.dappsInteractionType.dapps,
                        isActive: true,
                    },
                },
                {
                    $group: {
                        _id: null,
                        totalView: { $sum: { $first: '$relatedID' } },
                    },
                },
            ]);
            const allViewAndOpenDapps = yield Interaction_1.default.aggregate([
                {
                    $match: {
                        id: { $in: pinnedDapps.map((it) => it._id.toString()) },
                        isActive: true,
                    },
                },
                {
                    $group: {
                        _id: '$type',
                        total: { $sum: { $first: '$relatedID' } },
                    },
                },
            ]);
            const totalView = allViewCount[0] ? allViewCount[0].totalView : 0;
            const totalOpenData = allViewAndOpenDapps.find((it) => it._id === constant_1.dappsInteractionType.openDapp);
            const totalViewData = allViewAndOpenDapps.find((it) => it._id === constant_1.dappsInteractionType.dapps);
            req.response = {
                totalViewAll: totalView,
                totalFeaturedOpen: totalOpenData ? totalOpenData.total : 0,
                totalFeaturedView: totalViewData ? totalViewData.total : 0,
            };
            next();
        });
    }
}
exports.default = DappWorker;
//# sourceMappingURL=index.js.map