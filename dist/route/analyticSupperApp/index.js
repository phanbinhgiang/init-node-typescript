"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const analyticSupperApp_1 = __importDefault(require("../../worker/analyticSupperApp/analyticSupperApp"));
const router = express_1.default.Router();
// dashboard
router.use('/app', analyticSupperApp_1.default.getTotalDashboardData);
router.use('/app/chart', analyticSupperApp_1.default.getChartDashboard);
// user
router.use('/app/user', analyticSupperApp_1.default.getUserDashboard);
router.use('/app/user/country', analyticSupperApp_1.default.getPopularCountries);
router.use('/app/user/device', analyticSupperApp_1.default.getDeviceDashboard);
// wallet
router.use('/app/wallet', analyticSupperApp_1.default.getWalletDashboard);
router.use('/app/wallet/chart', analyticSupperApp_1.default.getWalletChart);
router.use('/app/wallet/chart/detail', analyticSupperApp_1.default.getWalletCreateNewAndRestore);
router.use('/app/wallet/chart/transaction', analyticSupperApp_1.default.getDetailTransaction);
exports.default = router;
//# sourceMappingURL=index.js.map