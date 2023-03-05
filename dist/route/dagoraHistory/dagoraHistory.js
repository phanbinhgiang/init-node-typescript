"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const dagoraHistory_1 = __importDefault(require("../../worker/dagora/dagoraHistory"));
const router = express_1.default.Router();
const jsonParser = body_parser_1.default.json();
// router.get('/', DagoraHistoryWorker.getDagoraHistory);
router.get('/reportInteractions', dagoraHistory_1.default.callDagoraReport);
router.get('/field', dagoraHistory_1.default.getDataDagoraReportField);
router.post('/', jsonParser, dagoraHistory_1.default.postDagoraHistory);
exports.default = router;
//# sourceMappingURL=dagoraHistory.js.map