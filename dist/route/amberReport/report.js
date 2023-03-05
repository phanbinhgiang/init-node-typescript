"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
// import bodyParser from 'body-parser';
const amberReport_1 = __importDefault(require("../../worker/amberReport/amberReport"));
// import MiddlewareServices from '../../middleware/index';
const router = express_1.default.Router();
// const jsonParser = bodyParser.json();
router.get('/', amberReport_1.default.getAmberReport);
router.post('/', amberReport_1.default.postReports);
// router.post('/', MiddlewareServices.checkPublicRequest, Report.postReports);
exports.default = router;
//# sourceMappingURL=report.js.map