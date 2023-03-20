import express from 'express';
import StartShipWorker from '../../worker/startShip/startShip';

const router = express.Router();

// dashboard
router.use('/explore', StartShipWorker.explore);
router.use('/detail/:id', StartShipWorker.getDetailBySlug);
router.use('/register', StartShipWorker.register);
router.use('/log', StartShipWorker.logRecord);
router.use('/listing', StartShipWorker.listingAdmin);
router.use('/update', StartShipWorker.update);
router.use('/delete/:id', StartShipWorker.delete);

export default router;
