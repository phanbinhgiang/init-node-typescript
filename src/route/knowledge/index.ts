import express from 'express';
// import MiddlewareServices from '../../middleware'
import topic from './knowledgeTopic';
import content from './knowledgeContent';
import comment from './knowledgeComment';
import Worker from '../../worker/knowledge';

const router = express.Router();

router.get('/voter', Worker.getVoteOfQuestion);
router.get('/interaction/user', Worker.getUserInteraction);
// router.get('/interaction/user', MiddlewareServices.authorizationAPI, Worker.getUserInteraction)
router.get('/cache', Worker.addViewToDB);
router.put('/', Worker.updateInteraction);

router.use('/topic', topic);
router.use('/content', content);
router.use('/comment', comment);

export default router;
