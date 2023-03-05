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
/* eslint-disable no-return-await */
/* eslint-disable no-underscore-dangle */
/* eslint-disable consistent-return */
/* eslint-disable max-len */
const get_1 = __importDefault(require("lodash/get"));
const Interaction_1 = __importDefault(require("../../model/interaction/Interaction"));
const KnowledgeComment_1 = __importDefault(require("../../model/knowledge/KnowledgeComment"));
const KnowledgeContent_1 = __importDefault(require("../../model/knowledge/KnowledgeContent"));
const constants_1 = require("../../service/knowledge/constants");
const function_1 = require("../function");
const user_1 = __importDefault(require("../system/user"));
const knowledgeContent_1 = __importDefault(require("./knowledgeContent"));
const cacheKey = 'KNOWLEDGE_CACHE_VIEW_KEY';
class KnowledgeWorker {
    static getUserInteraction(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.query;
            const payload = yield Interaction_1.default.find({ relatedID: id, type: { $in: [constants_1.knowledgeInteractionType.vote, constants_1.knowledgeInteractionType.likeComment, constants_1.knowledgeInteractionType.bookmark] }, isActive: true }, { id: 1, type: 1 }).lean();
            req.response = payload;
            next();
        });
    }
    static updateInteraction(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { type: sType, id, createUser, isActive, } = req.body;
            const type = constants_1.knowledgeInteractionType[sType];
            if (!type || type === constants_1.knowledgeInteractionType.view) {
                req.response = { errMess: 'invalidType' };
                return next();
            }
            const countExists = type === constants_1.knowledgeInteractionType.likeComment ? yield KnowledgeComment_1.default.countDocuments({ _id: id }) : yield KnowledgeContent_1.default.countDocuments({ _id: id, type: constants_1.knowledgeContentType.question });
            if (countExists === 0) {
                req.response = { errMess: 'idNotFound' };
                return next();
            }
            const foundInteraction = yield Interaction_1.default.findOne({ type, id, relatedID: createUser });
            if (foundInteraction) {
                yield foundInteraction.updateOne({ isActive });
            }
            else {
                yield Interaction_1.default.create({
                    id, type, relatedID: createUser, isActive,
                });
            }
            req.response = true;
            next();
        });
    }
    static getVoteOfQuestion(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id, size = 30 } = req.query;
            const foundQuestion = yield knowledgeContent_1.default.getContentByIdLocal(id, constants_1.knowledgeContentType.question);
            if (!foundQuestion) {
                req.response = { errMess: 'idNotFound' };
                return next();
            }
            const matchState = { id: foundQuestion._id, type: constants_1.knowledgeInteractionType.vote, isActive: true };
            if (size === 'all') {
                const payload = yield Interaction_1.default.find(matchState);
                const arrVoter = yield user_1.default.getByListLocal(payload.map((it) => it.relatedID[0]), constants_1.userFilter);
                req.response = { data: arrVoter };
                return next();
            }
            const payload = yield Interaction_1.default.find(matchState).sort({ createdAt: -1 }).limit(parseInt(size));
            const total = yield Interaction_1.default.countDocuments(matchState);
            const arrVoter = yield user_1.default.getByListLocal(payload.map((it) => it.relatedID[0]), constants_1.userFilter);
            req.response = { data: arrVoter, total };
            return next();
        });
    }
    static getInteractionOfQuestionLocal(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const payload = yield Interaction_1.default.find({ id: id.toString(), type: { $in: [constants_1.knowledgeInteractionType.vote, constants_1.knowledgeInteractionType.view, constants_1.knowledgeInteractionType.bookmark] }, isActive: true }).lean();
            const totalVote = (0, function_1.getLength)(payload.filter((it) => it.type === constants_1.knowledgeInteractionType.vote));
            const totalBookmark = (0, function_1.getLength)(payload.filter((it) => it.type === constants_1.knowledgeInteractionType.bookmark));
            const totalView = payload.filter((it) => it.type === constants_1.knowledgeInteractionType.view).reduce((total, item) => total + parseInt((0, get_1.default)(item, 'relatedID[0]', 0)), 0);
            return { totalVote, totalBookmark, totalView };
        });
    }
    static getInteractionOfCommentLocal(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield Interaction_1.default.countDocuments({ id: id.toString(), isActive: true, type: constants_1.knowledgeInteractionType.likeComment });
        });
    }
    static addInteractionDataLocal(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const key = `KNOWLEDGE-CACHE-${id}`;
            KnowledgeWorker.addKeyCacheRedis(key);
            const storageData = yield (0, function_1.getStorage)(key);
            if (storageData) {
                const newData = JSON.stringify(storageData.concat([Date.now()]));
                (0, function_1.saveStorage)(key, newData);
            }
            else {
                const newData = JSON.stringify([Date.now()]);
                (0, function_1.saveStorage)(key, newData);
            }
        });
    }
    static getInteractionVoteLocal(listID) {
        return __awaiter(this, void 0, void 0, function* () {
            const vote = yield Interaction_1.default.aggregate([
                {
                    $match: {
                        id: { $in: listID },
                        isActive: true,
                        type: constants_1.knowledgeInteractionType.vote,
                    },
                },
                {
                    $group: {
                        _id: '$id',
                        count: { $sum: 1 },
                    },
                },
            ]);
            return vote;
        });
    }
    static getInteractionBookmarkOfUserLocal(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const bookmark = yield Interaction_1.default.find({
                relatedID: { $in: [userId] },
                isActive: true,
                type: constants_1.knowledgeInteractionType.bookmark,
            }, 'id').lean();
            return bookmark;
        });
    }
    static getInteractionViewLocal(listID) {
        return __awaiter(this, void 0, void 0, function* () {
            const view = yield Interaction_1.default.aggregate([
                {
                    $match: {
                        id: { $in: listID },
                        isActive: true,
                        type: constants_1.knowledgeInteractionType.view,
                    },
                },
                {
                    $group: {
                        _id: '$id',
                        count: { $sum: { $first: '$relatedID' } },
                    },
                },
            ]);
            return view;
        });
    }
    static addKeyCacheRedis(keyId) {
        return __awaiter(this, void 0, void 0, function* () {
            const getData = yield (0, function_1.getStorage)(cacheKey);
            if (getData) {
                const newData = getData.concat([keyId]).filter(function_1.onlyUnique);
                (0, function_1.saveStorage)(cacheKey, newData);
            }
            else {
                (0, function_1.saveStorage)(cacheKey, [keyId]);
            }
        });
    }
    static clearKeyViewRedisLocal() {
        return __awaiter(this, void 0, void 0, function* () {
            (0, function_1.saveStorage)(cacheKey, []);
        });
    }
    static addViewToDB(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const allKeys = yield (0, function_1.getStorage)(cacheKey);
            if ((0, function_1.getLength)(allKeys) > 0) {
                yield allKeys.reduce((total, item) => __awaiter(this, void 0, void 0, function* () {
                    yield total.then(() => __awaiter(this, void 0, void 0, function* () {
                        const key = item;
                        const viewData = yield (0, function_1.getStorage)(key);
                        const id = key.replace('KNOWLEDGE-CACHE-', '');
                        if (!id) {
                            (0, function_1.deleteStore)(key);
                            return;
                        }
                        if (viewData) {
                            const totalView = (0, function_1.getLength)(viewData);
                            const newData = {
                                id,
                                type: constants_1.knowledgeInteractionType.view,
                                relatedID: [totalView],
                            };
                            yield Interaction_1.default.create(newData);
                        }
                        (0, function_1.deleteStore)(key);
                    }));
                }), Promise.resolve());
                yield KnowledgeWorker.clearKeyViewRedisLocal();
            }
            req.response = true;
            next();
        });
    }
    static clearInteractionOfQuestionLocal(id) {
        return __awaiter(this, void 0, void 0, function* () {
            // const payload = await Interaction.find({ id, type: { $in: [knowledgeInteractionType.bookmark, knowledgeInteractionType.view, knowledgeInteractionType.vote] } })
            // console.log('🚀 ~ file: index.js:138 ~ KnowledgeWorker ~ clearInteractionOfQuestionLocal ~ payload', payload)
            yield Interaction_1.default.deleteMany({ id, type: { $in: [constants_1.knowledgeInteractionType.bookmark, constants_1.knowledgeInteractionType.view, constants_1.knowledgeInteractionType.vote] } });
        });
    }
    static clearInteractionOfCommentByList(arrCommentId) {
        return __awaiter(this, void 0, void 0, function* () {
            // const payload = await Interaction.find({ id: { $in: arrCommentId }, type: knowledgeInteractionType.likeComment })
            // console.log('🚀 ~ file: index.js:144 ~ KnowledgeWorker ~ clearInteractionOfCommentByList ~ payload', payload)
            yield Interaction_1.default.deleteMany({ id: { $in: arrCommentId }, type: constants_1.knowledgeInteractionType.likeComment });
        });
    }
}
exports.default = KnowledgeWorker;
//# sourceMappingURL=index.js.map