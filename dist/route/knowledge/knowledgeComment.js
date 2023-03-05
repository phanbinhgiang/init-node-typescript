"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
// import MiddlewareServices from '../../middleware'
const knowledgeComment_1 = __importDefault(require("../../worker/knowledge/knowledgeComment"));
const router = express_1.default.Router();
router.get('/question', knowledgeComment_1.default.getQuestionComment);
router.get('/child', knowledgeComment_1.default.getChildComment);
router.post('/', knowledgeComment_1.default.create);
router.put('/', knowledgeComment_1.default.update);
// router.delete('/', MiddlewareServices.authorizationAPI, Worker.delete)
router.delete('/', knowledgeComment_1.default.delete);
exports.default = router;
//# sourceMappingURL=knowledgeComment.js.map