"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const middleware_1 = __importDefault(require("../../middleware"));
const knowledgeContent_1 = __importDefault(require("../../worker/knowledge/knowledgeContent"));
const router = express_1.default.Router();
router.get('/admx', knowledgeContent_1.default.getAdmin);
router.get('/admx/item/:id', knowledgeContent_1.default.getContentDetailByIdAdmin);
router.post('/admx', knowledgeContent_1.default.create);
router.put('/admx', knowledgeContent_1.default.update);
router.delete('/admx', knowledgeContent_1.default.delete);
// Client route
router.get('/', knowledgeContent_1.default.getfilterContent);
router.get('/item/:type/:id', knowledgeContent_1.default.getDetailContentById);
// Questions
router.get('/question', middleware_1.default.authorizationAPI, knowledgeContent_1.default.getListQuestion);
router.get('/question/item/:id', knowledgeContent_1.default.getQuestionDetailById);
router.post('/question', knowledgeContent_1.default.createQuestion);
router.put('/question', knowledgeContent_1.default.updateQuestion);
router.delete('/question', middleware_1.default.authorizationAPI, knowledgeContent_1.default.deleteQuestion);
exports.default = router;
//# sourceMappingURL=knowledgeContent.js.map