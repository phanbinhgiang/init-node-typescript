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
/* eslint-disable no-trailing-spaces */
/* eslint-disable prefer-object-spread */
/* eslint-disable object-curly-newline */
/* eslint-disable dot-notation */
/* eslint-disable no-return-await */
/* eslint-disable arrow-body-style */
/* eslint-disable quotes */
/* eslint-disable newline-per-chained-call */
/* eslint-disable max-len */
const get_1 = __importDefault(require("lodash/get"));
const knowledgeComment_1 = __importDefault(require("../../model/knowledgeComment/knowledgeComment"));
const knowledgeContent_1 = __importDefault(require("../../model/knowledgeContent/knowledgeContent"));
const User_1 = __importDefault(require("../../model/user/User"));
const Interaction_1 = __importDefault(require("../../model/interaction/Interaction"));
const knowledgeContentType = {
    faq: 'faq',
    article: 'article',
    question: 'question',
};
const getLength = (value) => {
    return value ? value.length : 0;
};
const genSortStateMongo = (sortString = '') => {
    if (getLength(sortString) === 0)
        return { createdAt: -1 };
    const isDesc = sortString[0] === '-';
    return isDesc ? { [sortString.substring(1)]: -1 } : { [sortString]: 1 };
};
const genSkipNum = (page, size) => {
    return (parseInt(page) - 1) * parseInt(size);
};
const knowledgeInteractionType = {
    bookmark: 'knowledgeBookmark',
    likeComment: 'knowledgeLikeComment',
    vote: 'knowledgeVote',
    view: 'knowledgeView',
};
const articleFilter = { author: 1, title: 1, description: 1, content: 1, createdAt: 1, updatedAt: 1, _id: 1, id: 1, topic: 1, image: 1 };
class KnowledgeReport {
    static getByIdLocal(id, filter) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield User_1.default.findOne({ id }, filter);
        });
    }
    static getInteractionOfQuestionLocal(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const payload = yield Interaction_1.default.find({ id: id.toString(), type: { $in: [knowledgeInteractionType.vote, knowledgeInteractionType.view, knowledgeInteractionType.bookmark] }, isActive: true }).lean();
            const totalVote = getLength(payload.filter((it) => it['type'] === knowledgeInteractionType.vote));
            const totalBookmark = getLength(payload.filter((it) => it['type'] === knowledgeInteractionType.bookmark));
            const totalView = payload.filter((it) => it['type'] === knowledgeInteractionType.view).reduce((total, item) => total + parseInt((0, get_1.default)(item, 'relatedID[0]', 0)), 0);
            return { totalVote, totalBookmark, totalView };
        });
    }
    static getTotalCommentOfQuestionLocal(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield knowledgeComment_1.default.countDocuments({ id });
            return data;
        });
    }
    static getFormatPayload(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield Promise.all(payload.map((it) => __awaiter(this, void 0, void 0, function* () {
                const authorData = yield KnowledgeReport.getByIdLocal(it['author'], { userName: 1, name: 1, userNameProfile: 1, image: 1, _id: 0 });
                const interaction = yield KnowledgeReport.getInteractionOfQuestionLocal(it['_id']);
                const totalComment = yield KnowledgeReport.getTotalCommentOfQuestionLocal(it['_id']);
                return Object.assign(it, { author: authorData, totalComment }, interaction);
            })));
        });
    }
    static getListQuestion(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { keyword, page = 1, size = 10, sort = '-createdAt' } = req.query;
            console.log({ header: req.headers });
            const matchState = {
                type: knowledgeContentType['question'],
            };
            if (getLength(keyword) > 0) {
                matchState.title = { $regex: `.*${keyword}.*`, $options: 'i' };
            }
            let payload = [];
            let formatPayload = [];
            let total = 0;
            const getInteractionVote = (listID) => __awaiter(this, void 0, void 0, function* () {
                const vote = yield Interaction_1.default.aggregate([
                    {
                        $match: {
                            id: { $in: listID },
                            isActive: true,
                            type: knowledgeInteractionType.vote,
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
            const getInteractionBookmark = (listID) => __awaiter(this, void 0, void 0, function* () {
                const bookmark = yield Interaction_1.default.find({
                    id: { $in: listID },
                    isActive: true,
                    type: knowledgeInteractionType.bookmark
                }, 'id');
                return bookmark;
            });
            const getInteractionView = (listID) => __awaiter(this, void 0, void 0, function* () {
                const view = yield Interaction_1.default.aggregate([
                    {
                        $match: {
                            id: { $in: listID },
                            isActive: true,
                            type: knowledgeInteractionType.view,
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
            switch (sort) {
                case 'trending': {
                    payload = yield knowledgeContent_1.default.find(matchState, '_id').lean();
                    const listID = payload.map((item) => item['_id'].toString());
                    const vote = yield getInteractionVote(listID);
                    const dataFilter = (listID.map((item) => {
                        const topVote = vote.find((index) => index['_id'] === item);
                        return { _id: item, votes: (0, get_1.default)(topVote, 'count', 0) };
                    }).sort((a, b) => b.votes - a.votes)).slice(genSkipNum(page, size), page * size).map((item) => item['_id']);
                    payload = yield knowledgeContent_1.default.find({ _id: { $in: dataFilter } }, articleFilter).lean();
                    total = yield knowledgeContent_1.default.countDocuments(matchState);
                    formatPayload = (yield KnowledgeReport.getFormatPayload(payload)).sort((a, b) => b.totalVote - a.totalVote);
                    break;
                }
                case 'topView': {
                    payload = yield knowledgeContent_1.default.find(matchState, '_id').lean();
                    const listID = payload.map((item) => item['_id'].toString());
                    const view = yield getInteractionView(listID);
                    const dataFilter = (listID.map((item) => {
                        const topView = view.find((index) => index['_id'] === item);
                        return { _id: item, views: (0, get_1.default)(topView, 'count', 0) };
                    }).sort((a, b) => b.views - a.views)).slice(genSkipNum(page, size), page * size).map((item) => item['_id']);
                    payload = yield knowledgeContent_1.default.find({ _id: { $in: dataFilter } }, articleFilter).lean();
                    total = yield knowledgeContent_1.default.countDocuments(matchState);
                    formatPayload = (yield KnowledgeReport.getFormatPayload(payload)).sort((a, b) => b.totalView - a.totalView);
                    break;
                }
                case 'save': {
                    payload = yield knowledgeContent_1.default.find(matchState, '_id').lean();
                    const listID = payload.map((item) => item['_id'].toString());
                    const bookmark = yield getInteractionBookmark(listID);
                    const dataFilter = bookmark.map((item) => item.id);
                    payload = yield knowledgeContent_1.default.find({ _id: { $in: dataFilter } }, articleFilter).sort(genSortStateMongo('')).skip(genSkipNum(page, size)).limit(parseInt(size)).lean();
                    total = yield knowledgeContent_1.default.countDocuments({ _id: { $in: dataFilter } });
                    formatPayload = yield KnowledgeReport.getFormatPayload(payload);
                    break;
                }
                default:
                    payload = yield knowledgeContent_1.default.find(matchState, articleFilter).sort(genSortStateMongo(sort)).skip(genSkipNum(page, size)).limit(parseInt(size)).lean();
                    total = yield knowledgeContent_1.default.countDocuments(matchState);
                    formatPayload = yield KnowledgeReport.getFormatPayload(payload);
                    break;
            }
            req.response = { data: formatPayload, total, totalPage: Math.ceil(total / parseInt(size)), currPage: parseInt(page) };
            next();
        });
    }
}
exports.default = KnowledgeReport;
//# sourceMappingURL=knowleadgeReport.js.map