"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
// import MiddlewareServices from '../../middleware'
const knowledgeTopic_1 = __importDefault(require("./knowledgeTopic"));
const knowledgeContent_1 = __importDefault(require("./knowledgeContent"));
const knowledgeComment_1 = __importDefault(require("./knowledgeComment"));
const knowledge_1 = __importDefault(require("../../worker/knowledge"));
const router = express_1.default.Router();
router.get('/voter', knowledge_1.default.getVoteOfQuestion);
router.get('/interaction/user', knowledge_1.default.getUserInteraction);
// router.get('/interaction/user', MiddlewareServices.authorizationAPI, Worker.getUserInteraction)
router.get('/cache', knowledge_1.default.addViewToDB);
router.put('/', knowledge_1.default.updateInteraction);
router.use('/topic', knowledgeTopic_1.default);
router.use('/content', knowledgeContent_1.default);
router.use('/comment', knowledgeComment_1.default);
exports.default = router;
//# sourceMappingURL=index.js.map