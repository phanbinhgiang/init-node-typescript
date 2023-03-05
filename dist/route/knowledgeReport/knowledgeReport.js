"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const knowleadgeReport_1 = __importDefault(require("../../worker/knowledgeReport/knowleadgeReport"));
const router = express_1.default.Router();
router.get('/', knowleadgeReport_1.default.getListQuestion);
exports.default = router;
//# sourceMappingURL=knowledgeReport.js.map