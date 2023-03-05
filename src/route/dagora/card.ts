import express from 'express';
import Worker from '../../worker/dagora/dagoraCard';

const router = express.Router();

router.get('/admx', Worker.getFilterCardAdmin);

export default router;
