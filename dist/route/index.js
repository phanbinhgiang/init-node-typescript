"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dagora_1 = __importDefault(require("./dagora"));
const amberReport_1 = __importDefault(require("./amberReport"));
const knowledge_1 = __importDefault(require("./knowledge"));
const dapps_1 = __importDefault(require("./dapps"));
const analyticSupperApp_1 = __importDefault(require("./analyticSupperApp"));
const router = express_1.default.Router();
router.use('/dagora', dagora_1.default);
router.use('/report', amberReport_1.default);
router.use('/knowledge', knowledge_1.default);
router.use('/dapps', dapps_1.default);
router.use('/analytic', analyticSupperApp_1.default);
exports.default = router;
//# sourceMappingURL=index.js.map