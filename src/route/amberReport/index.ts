import express from 'express';
import Report from './report';

const router = express.Router();

router.use('/', Report);

export default router;
