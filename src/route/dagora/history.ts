import express from 'express';
import bodyParser from 'body-parser';
import DagoraHistoryWorker from '../../worker/dagora/dagoraHistory';

const router = express.Router();
const jsonParser = bodyParser.json();

// router.get('/', DagoraHistoryWorker.getDagoraHistory);
router.get('/', DagoraHistoryWorker.callDagoraReport);
router.get('/field', DagoraHistoryWorker.getDataDagoraReportField);
router.post('/', jsonParser, DagoraHistoryWorker.postDagoraHistory);

export default router;
