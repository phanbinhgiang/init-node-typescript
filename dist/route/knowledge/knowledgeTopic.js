"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
// import MiddlewareServices from '../../middleware'
const knowledgeTopic_1 = __importDefault(require("../../worker/knowledge/knowledgeTopic"));
const router = express_1.default.Router();
// Admin Route
router.get('/admx', knowledgeTopic_1.default.getAdminTopic);
router.get('/admx/all', knowledgeTopic_1.default.getAllTopicAdmin);
router.get('/admx/item/:id', knowledgeTopic_1.default.getDetailById);
router.post('/admx', knowledgeTopic_1.default.create);
router.put('/admx', knowledgeTopic_1.default.update);
router.delete('/admx', knowledgeTopic_1.default.delete);
// Client Route
router.get('/', knowledgeTopic_1.default.getFilterTopic);
router.get('/item/:id', knowledgeTopic_1.default.getTopicDetailHomeById);
exports.default = router;
//# sourceMappingURL=knowledgeTopic.js.map