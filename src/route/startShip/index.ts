import express from 'express';
import swaggerUI from 'swagger-ui-express';
import Worker from '../../worker/startShip/startShip';
import docs from './docs.json';

const router = express.Router();

// // dashboard
// router.use('/explore', StartShipWorker.explore);
// router.use('/detail/:id', StartShipWorker.getDetailBySlug);
// router.use('/register', StartShipWorker.register);
// router.use('/log', StartShipWorker.logRecord);
// router.use('/listing', StartShipWorker.listingAdmin);
// // router.use('/update', StartShipWorker.update);
// // router.use('/delete/:id', StartShipWorker.delete);

// migrate
router.use('/docs', swaggerUI.serve, swaggerUI.setup(docs));

// Get current pad list for user
router.get('/explore', Worker.explore);
router.get('/detail/:id', Worker.getDetailBySlug);
router.get('/register/signature', Worker.registerSignature);

router.post('/register', Worker.register);
router.post('/log', Worker.logRecord);

router.put('/admx', Worker.updateAdmin);
router.delete('/admx/:id', Worker.deleteAdmin);
router.post('/admx/listing', Worker.listingAdmin);

export default router;
