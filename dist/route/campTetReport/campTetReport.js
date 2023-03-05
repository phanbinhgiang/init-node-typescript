"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const campTestReport_1 = __importDefault(require("../../worker/campTetReport/campTestReport"));
const router = express_1.default.Router();
router.get('/', campTestReport_1.default.getDataCampaign);
exports.default = router;
//# sourceMappingURL=campTetReport.js.map