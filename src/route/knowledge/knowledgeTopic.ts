import express from 'express';
// import MiddlewareServices from '../../middleware'
import Worker from '../../worker/knowledge/knowledgeTopic';

const router = express.Router();

// Admin Route
router.get('/admx', Worker.getAdminTopic);
router.get('/admx/all', Worker.getAllTopicAdmin);
router.get('/admx/item/:id', Worker.getDetailById);
router.post('/admx', Worker.create);
router.put('/admx', Worker.update);
router.delete('/admx', Worker.delete);

// Client Route
router.get('/', Worker.getFilterTopic);
router.get('/item/:id', Worker.getTopicDetailHomeById);

export default router;
