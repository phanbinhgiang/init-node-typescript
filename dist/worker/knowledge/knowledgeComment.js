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
const _1 = __importDefault(require("."));
const KnowledgeComment_1 = __importDefault(require("../../model/knowledge/KnowledgeComment"));
const functions_1 = require("../../service/functions");
const constants_1 = require("../../service/knowledge/constants");
const function_1 = require("../function");
const user_1 = __importDefault(require("../system/user"));
const knowledgeContent_1 = __importDefault(require("./knowledgeContent"));
class KnowledgeCommentWorker {
    static getQuestionComment(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id, page = 1, size = 10, sort = '-createdAt', } = req.query;
            const foundQuestion = yield knowledgeContent_1.default.getContentByIdLocal(id, constants_1.knowledgeContentType.question);
            if (!foundQuestion) {
                req.response = { errMess: 'idNotFound' };
                return next();
            }
            const matchState = {
                id: foundQuestion._id.toString(),
                fatherId: '',
                isActive: true,
            };
            const payload = yield KnowledgeComment_1.default.find(matchState, {
                author: 1, content: 1, createdAt: 1, image: 1,
            }).sort((0, functions_1.genSortStateMongo)(sort)).skip((0, function_1.genSkipNum)(page, size)).limit(parseInt(size))
                .lean();
            const total = yield KnowledgeComment_1.default.countDocuments(matchState);
            req.response = {
                data: yield KnowledgeCommentWorker.formatCommentDataLocal(payload, true),
                total,
                totalPage: Math.ceil(total / parseInt(size)),
                currPage: parseInt(page),
            };
            next();
        });
    }
    static getChildComment(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { fatherId, sort = 'createdAt' } = req.query;
            const matchState = {
                fatherId,
                isActive: true,
            };
            const payload = yield KnowledgeComment_1.default.find(matchState, {
                author: 1, content: 1, createdAt: 1, image: 1,
            }).sort((0, functions_1.genSortStateMongo)(sort)).lean();
            req.response = yield KnowledgeCommentWorker.formatCommentDataLocal(payload, false);
            next();
        });
    }
    static formatCommentDataLocal(arrComment, isCountChild = true) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield Promise.all(arrComment.map((it) => __awaiter(this, void 0, void 0, function* () {
                const countChildComment = isCountChild ? yield KnowledgeComment_1.default.countDocuments({ fatherId: it._id, isActive: true }) : 0;
                const author = yield user_1.default.getByIdLocal(it.author, {
                    name: 1, image: 1, _id: 0, id: 1,
                });
                const totalLike = yield _1.default.getInteractionOfCommentLocal(it._id);
                return Object.assign(it, { totalReply: countChildComment, author, totalLike });
            })));
        });
    }
    static create(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id, fatherId, content, author, image, } = req.body;
            yield KnowledgeComment_1.default.create({
                id, fatherId, content, author, image,
            });
            req.response = true;
            next();
        });
    }
    static update(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.body;
            const updateFiled = (0, function_1.genUpdate)(req.body, ['content', 'image']);
            KnowledgeComment_1.default.findOneAndUpdate({ _id: id }, updateFiled, { new: true }, (err, result) => {
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
            // const user = req.user
            const countExists = yield KnowledgeComment_1.default.countDocuments({ _id: id });
            if (countExists === 0) {
                req.response = { errMess: 'idNotFound' };
                return next();
            }
            yield KnowledgeComment_1.default.deleteOne({ _id: id });
            yield KnowledgeComment_1.default.deleteMany({ fatherId: id });
            req.response = true;
            next();
        });
    }
    //* Local
    static getTotalCommentOfQuestionLocal(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield KnowledgeComment_1.default.countDocuments({ id });
        });
    }
    static deleteCommentOfQuestionLocal(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const allComment = yield KnowledgeComment_1.default.find({ id }, { _id: 1 });
            yield _1.default.clearInteractionOfCommentByList(allComment.map((it) => it._id.toString()));
            yield KnowledgeComment_1.default.deleteMany({ id });
        });
    }
}
exports.default = KnowledgeCommentWorker;
//# sourceMappingURL=knowledgeComment.js.map