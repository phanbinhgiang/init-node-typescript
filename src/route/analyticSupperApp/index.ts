import express from 'express';
import AnalyticSupperAppWorker from '../../worker/analyticSupperApp/analyticSupperApp';

const router = express.Router();

// dashboard
router.use('/app', AnalyticSupperAppWorker.getTotalDashboardData);
router.use('/app/chart', AnalyticSupperAppWorker.getChartDashboard);

// user
router.use('/app/user', AnalyticSupperAppWorker.getUserDashboard);
router.use('/app/user/country', AnalyticSupperAppWorker.getPopularCountries);
router.use('/app/user/device', AnalyticSupperAppWorker.getDeviceDashboard);

// wallet
router.use('/app/wallet', AnalyticSupperAppWorker.getWalletDashboard);
router.use('/app/wallet/chart', AnalyticSupperAppWorker.getWalletChart);
router.use('/app/wallet/chart/detail', AnalyticSupperAppWorker.getWalletCreateNewAndRestore);
router.use('/app/wallet/chart/transaction', AnalyticSupperAppWorker.getDetailTransaction);

// swap
router.use('/app/swap', AnalyticSupperAppWorker.getSwapDashboard);
router.use('/app/swap/chart', AnalyticSupperAppWorker.getSwapChart);
router.use('/app/swap/top', AnalyticSupperAppWorker.getTopTokenSwap);

// update dashboardData
router.use('/app/update', AnalyticSupperAppWorker.updateDashboardData);

export default router;
