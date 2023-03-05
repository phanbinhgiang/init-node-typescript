import express from 'express';
import AnalyticSupperAppWorker from '../../worker/analyticSupperApp/analyticSupperApp';

const router = express.Router();

router.use('/app', AnalyticSupperAppWorker.getTotalDashboardData);
router.use('/app/chart', AnalyticSupperAppWorker.getChartDashboard);
router.use('/app/user', AnalyticSupperAppWorker.getUserDashboard);
router.use('/app/country', AnalyticSupperAppWorker.getPopularCountries);
router.use('/app/device', AnalyticSupperAppWorker.getDeviceDashboard);

export default router;
