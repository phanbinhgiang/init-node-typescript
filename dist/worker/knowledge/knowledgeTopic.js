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
const KnowledgeTopic_1 = __importDefault(require("../../model/knowledge/KnowledgeTopic"));
const function_1 = require("../function");
const knowledgeContent_1 = __importDefault(require("./knowledgeContent"));
const User_1 = __importDefault(require("../../model/user/User"));
const user_1 = __importDefault(require("../system/user"));
const constants_1 = require("../../service/knowledge/constants");
const function_2 = require("../../common/function");
const functions_1 = require("../../service/functions");
class KnowledgeTopicWorker {
    static getAdminTopic(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { keyword, page = 1, size = 10, from = 0, to = Date.now(), } = req.query;
            const matchState = {
                createdAt: {
                    $gte: new Date(parseInt(from)),
                    $lte: new Date(parseInt(to)),
                },
            };
            if ((0, function_1.getLength)(keyword) > 0) {
                matchState.title = { $regex: `.*${keyword}.*`, $options: 'i' };
            }
            const payload = yield KnowledgeTopic_1.default.find(matchState).sort({ createdAt: 1 }).skip((0, function_1.genSkipNum)(page, size)).limit(parseInt(size))
                .lean();
            const arrAuthorData = yield user_1.default.getByListLocal(payload.map((it) => it.author), constants_1.userFilter);
            const total = yield KnowledgeTopic_1.default.countDocuments(matchState);
            const formatTopic = yield KnowledgeTopicWorker.formatTopicDataLocal(payload);
            req.response = {
                data: KnowledgeTopicWorker.migrateAuthorToTopicLocal(formatTopic, arrAuthorData),
                total,
                totalPage: Math.ceil(total / parseInt(size)),
                currPage: parseInt(page),
            };
            next();
        });
    }
    static getFilterTopic(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { keyword, page = 1, size = 10, sort = '-createdAt', } = req.query;
            const matchState = {
                isActive: true,
            };
            if ((0, function_1.getLength)(keyword) > 0) {
                matchState.title = { $regex: `.*${keyword}.*`, $options: 'i' };
            }
            const payload = yield KnowledgeTopic_1.default.find(matchState, { isActive: 0, createdAt: 0, updatedAt: 0 }).sort((0, functions_1.genSortStateMongo)(sort)).skip((0, function_1.genSkipNum)(page, size)).limit(parseInt(size))
                .lean();
            const total = yield KnowledgeTopic_1.default.countDocuments(matchState);
            const formatTopic = yield KnowledgeTopicWorker.formatTopicDataLocal(payload);
            req.response = {
                data: formatTopic,
                total,
                totalPage: Math.ceil(total / parseInt(size)),
                currPage: parseInt(page),
            };
            next();
        });
    }
    // Landing API
    static getTopicDetailHomeById(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const topicPayload = yield KnowledgeTopic_1.default.findOne({ id }).lean();
            if (!topicPayload) {
                req.response = { errMess: 'idNotFound' };
                return next();
            }
            const formatCategory = yield KnowledgeTopicWorker.formatCategoryLocal(topicPayload._id, topicPayload.category);
            const arrAuthor = yield knowledgeContent_1.default.getAuthorOfTopicLocal(topicPayload._id);
            const authorData = yield User_1.default.find({ id: { $in: arrAuthor.map((it) => it._id) } }, {
                _id: 0, name: 1, userName: 1, image: 1,
            });
            req.response = Object.assign(Object.assign({}, topicPayload), { authors: authorData, category: formatCategory });
            next();
        });
    }
    // Local Funtions
    static formatCategoryLocal(topicId, arrCategory) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield Promise.all(arrCategory.map((it) => __awaiter(this, void 0, void 0, function* () {
                const totalArticle = yield knowledgeContent_1.default.countTotalArticleByTopicCategoryIdLocal(topicId, it._id);
                return Object.assign(Object.assign({}, it), { totalArticle });
            })));
        });
    }
    static formatTopicDataLocal(arrTopic) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield Promise.all(arrTopic.map((it) => __awaiter(this, void 0, void 0, function* () {
                const totalArticle = yield knowledgeContent_1.default.countTotalArticleByTopicIdLocal(it._id);
                return Object.assign(Object.assign({}, it), { totalArticle });
            })));
        });
    }
    static migrateAuthorToTopicLocal(arrTopic, arrAuthor) {
        return arrTopic.map((it) => {
            const foundAuthor = arrAuthor.find((usr) => usr.id === it.author);
            return Object.assign(it, { author: foundAuthor || { id: it.author } });
        });
    }
    // AdminAPI
    static getDetailById(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const payload = yield KnowledgeTopic_1.default.findOne({ _id: id });
            req.response = payload;
            return next();
        });
    }
    static getAllTopicAdmin(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const payload = yield KnowledgeTopic_1.default.find({ isActive: true }, { title: 1, image: 1, category: 1 }).lean();
            req.response = payload;
            next();
        });
    }
    static create(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { title, author, description, isActive, image, category, } = req.body;
            const id = (0, function_1.createSlug)(title);
            const countExists = yield KnowledgeTopic_1.default.countDocuments({ id });
            if (countExists > 0) {
                req.response = { errMess: 'titleExists' };
                return next();
            }
            const payload = yield KnowledgeTopic_1.default.create({
                id, title, author, description, isActive, image, category,
            });
            req.response = payload;
            next();
        });
    }
    static update(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.body;
            const updateFiled = (0, function_1.genUpdate)(req.body, ['title', 'author', 'description', 'isActive', 'image', 'category']);
            if (updateFiled.title) {
                const genId = (0, function_1.createSlug)(updateFiled.title);
                const countExists = yield KnowledgeTopic_1.default.countDocuments({ id: genId });
                if (countExists > 0) {
                    req.response = { errMess: 'titleExists' };
                    return next();
                }
                updateFiled.id = genId;
            }
            KnowledgeTopic_1.default.findOneAndUpdate({ _id: id }, updateFiled, { new: true }, (err, result) => {
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
            const { id } = req.query;
            const countExists = yield KnowledgeTopic_1.default.countDocuments({ _id: id });
            if (countExists === 0) {
                req.response = { errMess: 'idNotFound' };
                return next();
            }
            yield KnowledgeTopic_1.default.deleteOne({ _id: id });
            yield knowledgeContent_1.default.updateArticleTopic(id, '');
            req.response = true;
            next();
        });
    }
    //* Local fuctions for Other Worker
    static getTopicDetailbyIdLocal(topicId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield KnowledgeTopic_1.default.findOne({ $or: [{ id: topicId }, { _id: (0, function_2.convertToMongoID)(topicId) }] });
        });
    }
    static getListTopicDetailbyIdLocal(arrId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield KnowledgeTopic_1.default.find({ $or: [{ id: { $in: arrId } }, { _id: { $in: arrId } }] });
        });
    }
}
exports.default = KnowledgeTopicWorker;
//# sourceMappingURL=knowledgeTopic.js.map