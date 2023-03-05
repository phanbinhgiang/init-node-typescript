"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const analyticSupperApp_1 = __importDefault(require("../../worker/analyticSupperApp/analyticSupperApp"));
const router = express_1.default.Router();
router.use('/app', analyticSupperApp_1.default.getTotalDashboardData);
router.use('/app/chart', analyticSupperApp_1.default.getChartDashboard);
router.use('/app/user', analyticSupperApp_1.default.getUserDashboard);
router.use('/app/country', analyticSupperApp_1.default.getPopularCountries);
router.use('/app/device', analyticSupperApp_1.default.getDeviceDashboard);
exports.default = router;
//# sourceMappingURL=index.js.map