"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const analyticSupperApp_1 = __importDefault(require("../../worker/analyticSupperApp/analyticSupperApp"));
const router = express_1.default.Router();
// dashboard
router.use('/app/get', analyticSupperApp_1.default.getTotalDashboardData);
router.use('/app/chart', analyticSupperApp_1.default.getChartDashboard);
router.use('/app/cache', analyticSupperApp_1.default.cacheTotalDashboardData);
// user
router.use('/app/user/get', analyticSupperApp_1.default.getUserDashboard);
router.use('/app/user/cache', analyticSupperApp_1.default.cacheUserDashboard);
router.use('/app/user/country/get', analyticSupperApp_1.default.getPopularCountries);
router.use('/app/user/country/cache', analyticSupperApp_1.default.cachePopularCountries);
router.use('/app/user/device/get', analyticSupperApp_1.default.getDeviceDashboard);
router.use('/app/user/device/cache', analyticSupperApp_1.default.cacheDeviceDashboard);
// wallet
router.use('/app/wallet/get', analyticSupperApp_1.default.getWalletDashboard);
router.use('/app/wallet/cache', analyticSupperApp_1.default.cacheWalletDashboard);
router.use('/app/wallet/chart', analyticSupperApp_1.default.getWalletChart);
router.use('/app/wallet/chart/detail/get', analyticSupperApp_1.default.getWalletCreateNewAndRestore);
router.use('/app/wallet/chart/detail/cache', analyticSupperApp_1.default.cacheWalletCreateNewAndRestore);
router.use('/app/wallet/chart/transaction', analyticSupperApp_1.default.getDetailTransaction);
// swap
router.use('/app/swap', analyticSupperApp_1.default.getSwapDashboard);
router.use('/app/swap/chart', analyticSupperApp_1.default.getSwapChart);
router.use('/app/swap/top', analyticSupperApp_1.default.getTopTokenSwap);
// update dashboardData
router.use('/app/update', analyticSupperApp_1.default.updateDashboardData);
exports.default = router;
//# sourceMappingURL=index.js.map