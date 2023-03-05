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
const function_1 = require("../../common/function");
const Interaction_1 = __importDefault(require("../../model/interaction/Interaction"));
const function_2 = require("../function");
const constant_1 = require("./constant");
const index_1 = __importDefault(require("./index"));
const allViewRediskeys = 'DAPPS_VIEW_CACHE_KEYS';
const allOpenRediskeys = 'DAPPS_OPEN_CACHE_KEYS';
class InteractionWorker {
    static addViewWithUserLocal(slug, userId, isOpen = false) {
        return __awaiter(this, void 0, void 0, function* () {
            const key = `DAPPS_${isOpen ? 'OPEN' : 'VIEW'}_${slug}`;
            InteractionWorker.addKeyCacheRedis(key, isOpen);
            const storageData = yield (0, function_2.getStorage)(key);
            if (storageData) {
                const newData = storageData.concat([userId]);
                (0, function_2.saveStorage)(key, newData);
            }
            else {
                (0, function_2.saveStorage)(key, [userId]);
            }
        });
    }
    static addKeyCacheRedis(keyId, isOpen) {
        return __awaiter(this, void 0, void 0, function* () {
            const cacheKey = isOpen ? allOpenRediskeys : allViewRediskeys;
            const getData = yield (0, function_2.getStorage)(cacheKey);
            if (getData) {
                const newData = getData.concat([keyId]).filter(function_2.onlyUnique);
                (0, function_2.saveStorage)(cacheKey, newData);
            }
            else {
                (0, function_2.saveStorage)(cacheKey, [keyId]);
            }
        });
    }
    static addViewToDB(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { type } = req.query;
            const cacheKey = type === 'open' ? allOpenRediskeys : allViewRediskeys;
            const allKeys = yield (0, function_2.getStorage)(cacheKey);
            req.response = true;
            next();
            if ((0, function_1.getLength)(allKeys) > 0) {
                yield allKeys.reduce((total, item) => __awaiter(this, void 0, void 0, function* () {
                    yield total.then(() => __awaiter(this, void 0, void 0, function* () {
                        const key = item;
                        const viewData = yield (0, function_2.getStorage)(key);
                        const dappsId = item.replace('DAPPS_VIEW_', '').replace('DAPPS_OPEN_', '');
                        if (dappsId === 'homeView') {
                            const newData = {
                                id: dappsId,
                                type: type === 'open' ? constant_1.dappsInteractionType.openDapp : constant_1.dappsInteractionType.dapps,
                                relatedID: [(0, function_1.getLength)(viewData)],
                            };
                            yield Interaction_1.default.create(newData);
                            return;
                        }
                        const foundDapp = yield index_1.default.getDappsByIdLocal(dappsId);
                        if (!foundDapp) {
                            return;
                        }
                        if (viewData) {
                            const formatData = viewData.reduce((total, userId) => {
                                total[userId] = (total[userId] || 0) + 1;
                                return total;
                            }, {});
                            const inserData = Object.keys(formatData).map((it) => {
                                const newData = {
                                    id: foundDapp._id,
                                    type: type === 'open' ? constant_1.dappsInteractionType.openDapp : constant_1.dappsInteractionType.dapps,
                                    relatedID: [formatData[it]],
                                    info: {
                                        userId: it,
                                    },
                                };
                                return newData;
                            });
                            yield Interaction_1.default.insertMany(inserData);
                            (0, function_2.deleteStore)(key);
                        }
                    }));
                }), Promise.resolve());
                yield InteractionWorker.clearKeyViewRedisLocal(type === 'open');
            }
        });
    }
    static clearKeyViewRedisLocal(isOpen) {
        return __awaiter(this, void 0, void 0, function* () {
            if (isOpen) {
                (0, function_2.saveStorage)(allOpenRediskeys, []);
            }
            else {
                (0, function_2.saveStorage)(allViewRediskeys, []);
            }
        });
    }
    static getTopViewLocal(type, page = 1, size = 5, startTime = 0, endtime = Date.now()) {
        return __awaiter(this, void 0, void 0, function* () {
            const matchState = {
                createdAt: {
                    $gte: new Date(startTime),
                    $lte: new Date(endtime),
                },
                id: { $ne: 'homeView' },
                type,
            };
            const payload = yield Interaction_1.default.aggregate([
                {
                    $match: matchState,
                },
                {
                    $group: {
                        _id: '$id',
                        view: { $sum: { $first: '$relatedID' } },
                    },
                },
                {
                    $sort: {
                        view: -1,
                    },
                },
                {
                    $limit: parseInt(size) * parseInt(page),
                },
                {
                    $lookup: constant_1.lookupDapps,
                },
                {
                    $unwind: '$dapps',
                },
            ]);
            if ((0, function_1.getLength)(payload) < (parseInt(size) * parseInt(page))) {
                const moreData = yield index_1.default.getDappsOfgenreLocal(null, null, (parseInt(size) * parseInt(page)) - (0, function_1.getLength)(payload), payload.map((it) => it.dapps.slug));
                if (startTime !== 0) {
                    const allView = yield InteractionWorker.getViewOfIdLocal(payload.map((it) => it.dapps).concat(moreData).slice((parseInt(page) - 1) * parseInt(size), parseInt(size) * parseInt(page)).map((it) => it._id));
                    return payload.map((it) => it.dapps).concat(moreData).slice((parseInt(page) - 1) * parseInt(size), parseInt(size) * parseInt(page)).map((it) => {
                        const foundView = allView.find((view) => view._id === it._id.toString());
                        return Object.assign({ view: foundView ? foundView.view : 0 }, it);
                    });
                }
                return payload.map((it) => it.dapps).concat(moreData).slice((parseInt(page) - 1) * parseInt(size), parseInt(size) * parseInt(page)).map((it) => {
                    const foundView = payload.find((view) => view._id === it._id.toString());
                    return Object.assign({ view: foundView ? foundView.view : 0 }, it);
                });
            }
            if (startTime !== 0) {
                const allView = yield InteractionWorker.getViewOfIdLocal(payload.map((it) => it.dapps._id));
                return payload.map((it) => it.dapps).map((it) => {
                    const foundView = allView.find((view) => view._id === it._id.toString());
                    return Object.assign({ view: foundView ? foundView.view : 0 }, it);
                });
            }
            return payload.map((it) => it.dapps).map((it) => {
                const foundView = payload.find((view) => view._id === it._id.toString());
                return Object.assign({ view: foundView ? foundView.view : 0 }, it);
            });
        });
    }
    static getViewOfIdLocal(arrId, type = null, startDate = new Date(0)) {
        return __awaiter(this, void 0, void 0, function* () {
            const matchState = {
                id: { $in: arrId.map((it) => it.toString()) },
                createdAt: { $gte: startDate },
                type: { $in: [constant_1.dappsInteractionType.dapps, constant_1.dappsInteractionType.openDapp] },
            };
            if (type) {
                matchState.type = type;
            }
            const payload = yield Interaction_1.default.aggregate([
                {
                    $match: matchState,
                },
                {
                    $group: {
                        _id: '$id',
                        view: { $sum: { $first: '$relatedID' } },
                    },
                },
                {
                    $sort: {
                        view: -1,
                    },
                },
            ]);
            return payload;
        });
    }
    static getUserDappsLocal(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const matchState = {
                type: { $in: [constant_1.dappsInteractionType.dapps, constant_1.dappsInteractionType.openDapp] },
                'info.userId': userId,
            };
            const payload = yield Interaction_1.default.aggregate([
                {
                    $match: matchState,
                },
                {
                    $group: {
                        _id: '$id',
                        totalView: { $sum: { $first: '$relatedID' } },
                    },
                },
                {
                    $sort: {
                        totalView: -1,
                    },
                },
            ]);
            return payload;
        });
    }
    static addViewOpenDapps(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { slug } = req.body;
            const { user } = req;
            InteractionWorker.addViewWithUserLocal(slug, user, true);
            req.response = true;
            next();
        });
    }
}
exports.default = InteractionWorker;
//# sourceMappingURL=dappsInteraction.js.map