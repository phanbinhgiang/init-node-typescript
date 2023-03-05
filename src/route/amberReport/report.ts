import express from 'express';
// import bodyParser from 'body-parser';
import Report from '../../worker/amberReport/amberReport';
// import MiddlewareServices from '../../middleware/index';

const router = express.Router();
// const jsonParser = bodyParser.json();

router.get('/', Report.getAmberReport);
router.post('/', Report.postReports);
// router.post('/', MiddlewareServices.checkPublicRequest, Report.postReports);

export default router;
