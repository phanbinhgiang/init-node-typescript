import express from 'express';
import AnalyticSupperAppWorker from '../../worker/analyticSupperApp/analyticSupperApp';

const router = express.Router();

// dashboard
router.use('/app/get', AnalyticSupperAppWorker.getTotalDashboardData);
router.use('/app/chart', AnalyticSupperAppWorker.getChartDashboard);
router.use('/app/cache', AnalyticSupperAppWorker.cacheTotalDashboardData);

// user
router.use('/app/user/get', AnalyticSupperAppWorker.getUserDashboard);
router.use('/app/user/cache', AnalyticSupperAppWorker.cacheUserDashboard);
router.use('/app/user/country/get', AnalyticSupperAppWorker.getPopularCountries);
router.use('/app/user/country/cache', AnalyticSupperAppWorker.cachePopularCountries);
router.use('/app/user/device/get', AnalyticSupperAppWorker.getDeviceDashboard);
router.use('/app/user/device/cache', AnalyticSupperAppWorker.cacheDeviceDashboard);

// wallet
router.use('/app/wallet/get', AnalyticSupperAppWorker.getWalletDashboard);
router.use('/app/wallet/cache', AnalyticSupperAppWorker.cacheWalletDashboard);
router.use('/app/wallet/chart', AnalyticSupperAppWorker.getWalletChart);
router.use('/app/wallet/chart/detail/get', AnalyticSupperAppWorker.getWalletCreateNewAndRestore);
router.use('/app/wallet/chart/detail/cache', AnalyticSupperAppWorker.cacheWalletCreateNewAndRestore);
router.use('/app/wallet/chart/transaction', AnalyticSupperAppWorker.getDetailTransaction);

// swap
router.use('/app/swap/get', AnalyticSupperAppWorker.getSwapDashboard);
router.use('/app/swap/cache', AnalyticSupperAppWorker.cacheSwapDashboard);
router.use('/app/swap/chart', AnalyticSupperAppWorker.getSwapChart);
router.use('/app/swap/top/get', AnalyticSupperAppWorker.getTopTokenSwap);
router.use('/app/swap/top/cache', AnalyticSupperAppWorker.cacheTopTokenSwap);

// update dashboardData
router.use('/app/update', AnalyticSupperAppWorker.updateDashboardData);

export default router;
