import express from 'express';
import dagora from './dagora';
import report from './amberReport';
import knowledge from './knowledge';
import dapps from './dapps';
import analyticSupperApp from './analyticSupperApp';

const router = express.Router();
router.use('/dagora', dagora);
router.use('/report', report);
router.use('/knowledge', knowledge);
router.use('/dapps', dapps);
router.use('/analytic', analyticSupperApp);

export default router;
