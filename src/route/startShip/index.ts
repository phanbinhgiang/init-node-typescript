import express from 'express';
import StartShipWorker from '../../worker/startShip/startShip';

const router = express.Router();

// dashboard
router.use('/explore', StartShipWorker.explore);
router.use('/explore/:id', StartShipWorker.getDetailBySlug);
router.use('/register', StartShipWorker.register);
router.use('/log', StartShipWorker.logRecord);
router.use('/listing', StartShipWorker.listingAdmin);

export default router;
