import express from 'express';
// import MiddlewareServices from '../../middleware'
import Worker from '../../worker/knowledge/knowledgeComment';

const router = express.Router();

router.get('/question', Worker.getQuestionComment);
router.get('/child', Worker.getChildComment);
router.post('/', Worker.create);
router.put('/', Worker.update);
// router.delete('/', MiddlewareServices.authorizationAPI, Worker.delete)
router.delete('/', Worker.delete);

export default router;
