import express from 'express';
import Card from './card';
import History from './history';

const router = express.Router();

router.use('/card', Card);
router.use('/history', History);

export default router;
