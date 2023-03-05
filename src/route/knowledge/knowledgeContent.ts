import express from 'express';
import MiddlewareServices from '../../middleware';
import Worker from '../../worker/knowledge/knowledgeContent';

const router = express.Router();

router.get('/admx', Worker.getAdmin);
router.get('/admx/item/:id', Worker.getContentDetailByIdAdmin);
router.post('/admx', Worker.create);
router.put('/admx', Worker.update);
router.delete('/admx', Worker.delete);

// Client route
router.get('/', Worker.getfilterContent);
router.get('/item/:type/:id', Worker.getDetailContentById);

// Questions
router.get('/question', MiddlewareServices.authorizationAPI, Worker.getListQuestion);
router.get('/question/item/:id', Worker.getQuestionDetailById);
router.post('/question', Worker.createQuestion);
router.put('/question', Worker.updateQuestion);
router.delete('/question', MiddlewareServices.authorizationAPI, Worker.deleteQuestion);

export default router;
