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

export default router;
