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
/* eslint-disable max-len */
/* eslint-disable no-return-await */
/* eslint-disable no-underscore-dangle */
/* eslint-disable consistent-return */
const get_1 = __importDefault(require("lodash/get"));
const KnowledgeContent_1 = __importDefault(require("../../model/knowledge/KnowledgeContent"));
const function_1 = require("../function");
const constants_1 = require("../../service/knowledge/constants");
const functions_1 = require("../../service/functions");
const knowledgeTopic_1 = __importDefault(require("./knowledgeTopic"));
const index_1 = __importDefault(require("./index"));
const user_1 = __importDefault(require("../system/user"));
const knowledgeComment_1 = __importDefault(require("./knowledgeComment"));
const function_2 = require("../../common/function");
const articleFilter = {
    author: 1, title: 1, description: 1, content: 1, createdAt: 1, updatedAt: 1, _id: 1, id: 1, topic: 1,
};
class KnowledgeContentWorker {
    //* Admin Section
    static getAdmin(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { keyword, page = 1, size = 10, type = constants_1.knowledgeContentType.article, topic, from = 0, to = Date.now(), } = req.query;
            const matchState = {
                type,
                createdAt: {
                    $gte: new Date(parseInt(from)),
                    $lte: new Date(parseInt(to)),
                },
            };
            if ((0, function_1.getLength)(keyword) > 0) {
                matchState.title = { $regex: `.*${keyword}.*`, $options: 'i' };
            }
            if ((0, function_1.getLength)(topic) > 0) {
                matchState.topic = topic;
            }
            const payload = yield KnowledgeContent_1.default.find(matchState).sort({ createdAt: 1 }).skip((0, function_1.genSkipNum)(page, size)).limit(parseInt(size))
                .lean();
            const arrAuthor = yield user_1.default.getByListLocal(payload.map((it) => it.author), {
                userName: 1, name: 1, userNameProfile: 1, image: 1, id: 1, _id: 0,
            });
            const arrTopic = yield knowledgeTopic_1.default.getListTopicDetailbyIdLocal(payload.map((it) => (0, function_2.convertToMongoID)(it.topic)));
            console.log('🚀 ~ file: knowledgeContent.js:36 ~ KnowledgeContentWorker ~ getAdmin ~ arrTopic', arrTopic);
            const total = yield KnowledgeContent_1.default.countDocuments(matchState);
            req.response = {
                data: KnowledgeContentWorker.migrateAuthorToDataLocal(payload, arrAuthor, arrTopic),
                total,
                totalPage: Math.ceil(total / parseInt(size)),
                currPage: parseInt(page),
            };
            next();
        });
    }
    static getContentDetailByIdAdmin(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const payload = yield KnowledgeContent_1.default.findOne({ _id: id });
            req.response = payload;
            next();
        });
    }
    static create(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { title, author, content, topic, category, type, description, isActive, } = req.body;
            const id = (0, function_1.createSlug)(title);
            const countExists = yield KnowledgeContent_1.default.countDocuments({ id, type });
            if (countExists > 0) {
                req.response = { errMess: 'titleExists' };
                return next();
            }
            const payload = yield KnowledgeContent_1.default.create({
                id, title, author, content, category, topic, type, description, isActive,
            });
            req.response = payload;
            next();
        });
    }
    static update(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.body;
            const updateFiled = (0, function_1.genUpdate)(req.body, ['title', 'author', 'content', 'category', 'topic', 'description', 'isActive']);
            if (updateFiled.title) {
                const genId = (0, function_1.createSlug)(updateFiled.title);
                const countExists = yield KnowledgeContent_1.default.countDocuments({ id: genId });
                if (countExists > 0) {
                    req.response = { errMess: 'titleExists' };
                    return next();
                }
                updateFiled.id = genId;
            }
            KnowledgeContent_1.default.findOneAndUpdate({ _id: id }, updateFiled, { new: true }, (err, result) => {
                if (!err && result) {
                    req.response = true;
                    next();
                }
                else {
                    req.response = false;
                    req.success = false;
                    next();
                }
            });
        });
    }
    static delete(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id, type } = req.query;
            if ((0, function_1.getLength)(type) === 0 || type === constants_1.knowledgeContentType.question) {
                req.response = { errMess: 'invalidType' };
                return next();
            }
            const countExists = yield KnowledgeContent_1.default.countDocuments({ _id: id, type });
            if (countExists === 0) {
                req.response = { errMess: 'idNotFound' };
                return next();
            }
            yield KnowledgeContent_1.default.deleteOne({ _id: id, type });
            req.response = true;
            next();
        });
    }
    // Loal fuction
    static migrateAuthorToDataLocal(arrData, arrAuthor, arrTopic) {
        return arrData.map((it) => {
            const foundAuthor = arrAuthor.find((usr) => usr.id === it.author);
            const foundTopic = arrTopic.find((tp) => tp._id.toString() === it.topic);
            return Object.assign(it, { author: foundAuthor || { id: it.author }, topic: foundTopic ? foundTopic.title : '' });
        });
    }
    static updateArticleTopic(oldTopic, newTopic) {
        return __awaiter(this, void 0, void 0, function* () {
            yield KnowledgeContent_1.default.updateMany({ type: constants_1.knowledgeContentType.article, topic: oldTopic.toString() }, { topic: newTopic });
        });
    }
    //* User Sections
    static getfilterContent(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { page = 1, size = 10, keyword, type = constants_1.knowledgeContentType.article, topic, category, sort = 'createdAt', } = req.query;
            const matchState = {
                type,
                isActive: true,
            };
            if ((0, function_1.getLength)(topic) > 0) {
                const topicPayload = yield knowledgeTopic_1.default.getTopicDetailbyIdLocal(topic);
                if (topicPayload) {
                    matchState.topic = topicPayload._id.toString();
                }
            }
            if ((0, function_1.getLength)(category) > 0) {
                matchState.category = category;
            }
            if ((0, function_1.getLength)(keyword) > 0) {
                matchState.title = { $regex: `.*${keyword}.*`, $options: 'i' };
            }
            const payload = yield KnowledgeContent_1.default.find(matchState, articleFilter).sort((0, functions_1.genSortStateMongo)(sort)).skip((0, function_1.genSkipNum)(page, size)).limit(parseInt(size))
                .lean();
            const total = yield KnowledgeContent_1.default.countDocuments(matchState);
            const formatPayload = yield Promise.all(payload.map((it) => __awaiter(this, void 0, void 0, function* () {
                const authorData = yield user_1.default.getByIdLocal(it.author, {
                    userName: 1, name: 1, userNameProfile: 1, image: 1, _id: 0,
                });
                return Object.assign(it, { author: authorData });
            })));
            req.response = {
                data: formatPayload, total, totalPage: Math.ceil(total / parseInt(size)), currPage: parseInt(page),
            };
            next();
        });
    }
    static getDetailContentById(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id, type } = req.params;
            if ((0, function_1.getLength)(id) === 0 || (0, function_1.getLength)(type) === 0) {
                req.response = { errMess: 'missingParams' };
                next();
            }
            const payload = yield KnowledgeContent_1.default.findOne({ id, type }, articleFilter).lean();
            if (!payload) {
                req.response = { errMess: 'idNotfound' };
                next();
            }
            const topicData = yield knowledgeTopic_1.default.getTopicDetailbyIdLocal(payload.topic);
            const author = yield user_1.default.getByIdLocal(payload.author, {
                userName: 1, name: 1, userNameProfile: 1, image: 1, _id: 0,
            });
            req.response = Object.assign(payload, { author, topic: topicData.title });
            next();
        });
    }
    //* Question
    static formatQuestionLocal(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield Promise.all(payload.map((it) => __awaiter(this, void 0, void 0, function* () {
                const authorData = yield user_1.default.getByIdLocal(it.author, {
                    userName: 1, name: 1, userNameProfile: 1, image: 1, _id: 0,
                });
                const interaction = yield index_1.default.getInteractionOfQuestionLocal(it._id);
                const totalComment = yield knowledgeComment_1.default.getTotalCommentOfQuestionLocal(it._id);
                return Object.assign(it, { author: authorData, totalComment }, interaction);
            })));
        });
    }
    static getListQuestion(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { keyword, page = 1, size = 10, sort = '-createdAt', } = req.query;
            const userId = req.user;
            const matchState = {
                type: constants_1.knowledgeContentType.question,
            };
            if ((0, function_1.getLength)(keyword) > 0) {
                matchState.title = { $regex: `.*${keyword}.*`, $options: 'i' };
            }
            let payload = [];
            let formatPayload = [];
            let total = 0;
            switch (sort) {
                case 'trending': {
                    payload = yield KnowledgeContent_1.default.find(matchState, '_id').lean();
                    const listID = payload.map((item) => item._id.toString());
                    const vote = yield index_1.default.getInteractionVoteLocal(listID);
                    const dataFilter = (listID.map((item) => {
                        const topVote = vote.find((index) => index._id === item);
                        return { _id: item, votes: (0, get_1.default)(topVote, 'count', 0) };
                    }).sort((a, b) => b.votes - a.votes)).slice((0, function_1.genSkipNum)(page, size), page * size).map((item) => item._id);
                    payload = yield KnowledgeContent_1.default.find({ _id: { $in: dataFilter } }, articleFilter).lean();
                    total = yield KnowledgeContent_1.default.countDocuments(matchState);
                    formatPayload = (yield KnowledgeContentWorker.formatQuestionLocal(payload)).sort((a, b) => b.totalVote - a.totalVote);
                    break;
                }
                case 'topView': {
                    payload = yield KnowledgeContent_1.default.find(matchState, '_id').lean();
                    const listID = payload.map((item) => item._id.toString());
                    const view = yield index_1.default.getInteractionViewLocal(listID);
                    const dataFilter = (listID.map((item) => {
                        const topView = view.find((index) => index._id === item);
                        return { _id: item, views: (0, get_1.default)(topView, 'count', 0) };
                    }).sort((a, b) => b.views - a.views)).slice((0, function_1.genSkipNum)(page, size), page * size).map((item) => item._id);
                    payload = yield KnowledgeContent_1.default.find({ _id: { $in: dataFilter } }, articleFilter).lean();
                    total = yield KnowledgeContent_1.default.countDocuments(matchState);
                    formatPayload = (yield KnowledgeContentWorker.formatQuestionLocal(payload)).sort((a, b) => b.totalView - a.totalView);
                    break;
                }
                case 'save': {
                    const bookmark = yield index_1.default.getInteractionBookmarkOfUserLocal(userId);
                    const dataFilter = bookmark.map((item) => item.id);
                    payload = yield KnowledgeContent_1.default.find({ _id: { $in: dataFilter } }, articleFilter).sort((0, functions_1.genSortStateMongo)('')).skip((0, function_1.genSkipNum)(page, size)).limit(parseInt(size))
                        .lean();
                    total = (0, function_1.getLength)(bookmark);
                    formatPayload = yield KnowledgeContentWorker.formatQuestionLocal(payload);
                    break;
                }
                default:
                    payload = yield KnowledgeContent_1.default.find(matchState, articleFilter).sort((0, functions_1.genSortStateMongo)(sort)).skip((0, function_1.genSkipNum)(page, size)).limit(parseInt(size))
                        .lean();
                    total = yield KnowledgeContent_1.default.countDocuments(matchState);
                    formatPayload = yield KnowledgeContentWorker.formatQuestionLocal(payload);
                    break;
            }
            req.response = {
                data: formatPayload, total, totalPage: Math.ceil(total / parseInt(size)), currPage: parseInt(page),
            };
            next();
        });
    }
    static getQuestionDetailById(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const payload = yield KnowledgeContent_1.default.findOne({ id, type: constants_1.knowledgeContentType.question }, { type: 0 }).lean();
            index_1.default.addInteractionDataLocal(payload._id);
            const authorData = yield user_1.default.getByIdLocal(payload.author, {
                userName: 1, name: 1, userNameProfile: 1, image: 1, _id: 0, id: 1,
            });
            const interaction = yield index_1.default.getInteractionOfQuestionLocal(payload._id);
            const totalComment = yield knowledgeComment_1.default.getTotalCommentOfQuestionLocal(payload._id);
            req.response = Object.assign(payload, { author: authorData, totalComment }, interaction);
            next();
        });
    }
    static createQuestion(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { title, author, content, image, } = req.body;
            const id = (0, function_1.createSlug)(title);
            const countExists = yield KnowledgeContent_1.default.countDocuments({ id, type: constants_1.knowledgeContentType.question });
            if (countExists > 0) {
                req.response = { errMess: 'titleExists' };
                return next();
            }
            yield KnowledgeContent_1.default.create({
                id, title, author, content, type: constants_1.knowledgeContentType.question, image,
            });
            req.response = true;
            next();
        });
    }
    static updateQuestion(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.body;
            const updateFiled = (0, function_1.genUpdate)(req.body, ['title', 'author', 'content', 'image', 'isActive']);
            if (updateFiled.title) {
                const genId = (0, function_1.createSlug)(updateFiled.title);
                const countExists = yield KnowledgeContent_1.default.countDocuments({ id: genId, type: constants_1.knowledgeContentType.question });
                if (countExists > 0) {
                    req.response = { errMess: 'titleExists' };
                    return next();
                }
                updateFiled.id = genId;
            }
            KnowledgeContent_1.default.findOneAndUpdate({ _id: id }, updateFiled, { new: true }, (err, result) => {
                if (!err && result) {
                    req.response = true;
                    next();
                }
                else {
                    req.response = false;
                    req.success = false;
                    next();
                }
            });
        });
    }
    static deleteQuestion(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.query;
            const { user } = req;
            const countExists = yield KnowledgeContent_1.default.countDocuments({ _id: id, type: constants_1.knowledgeContentType.question, author: user });
            if (countExists === 0) {
                req.response = { errMess: 'idNotFound' };
                return next();
            }
            yield KnowledgeContent_1.default.deleteOne({ _id: id, type: constants_1.knowledgeContentType.question });
            yield knowledgeComment_1.default.deleteCommentOfQuestionLocal(id);
            yield index_1.default.clearInteractionOfQuestionLocal(id);
            req.response = true;
            next();
        });
    }
    // Local
    static countTotalArticleByTopicIdLocal(topicId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield KnowledgeContent_1.default.countDocuments({ isActive: true, topic: topicId, type: constants_1.knowledgeContentType.article });
        });
    }
    static countTotalArticleByTopicCategoryIdLocal(topicId, categoryId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield KnowledgeContent_1.default.countDocuments({
                isActive: true, topic: topicId, category: categoryId, type: constants_1.knowledgeContentType.article,
            });
        });
    }
    static getAuthorOfTopicLocal(topicId) {
        return __awaiter(this, void 0, void 0, function* () {
            const payload = KnowledgeContent_1.default.aggregate([
                {
                    $match: {
                        isActive: true,
                        topic: topicId.toString(),
                        type: constants_1.knowledgeContentType.article,
                    },
                },
                {
                    $group: {
                        _id: '$author',
                        total: { $sum: 1 },
                    },
                },
            ]);
            return payload;
        });
    }
    static getContentByIdLocal(contentId, type) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield KnowledgeContent_1.default.findOne({ id: contentId, type }).lean();
        });
    }
}
exports.default = KnowledgeContentWorker;
//# sourceMappingURL=knowledgeContent.js.map