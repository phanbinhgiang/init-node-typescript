/* eslint-disable max-len */
import express from 'express';
import Worker from '../../worker/dapps';
import Genre from '../../worker/dapps/genre';
import Interaction from '../../worker/dapps/dappsInteraction';

// import MiddlewareServices from '../../middleware';

const router = express.Router();

// router.get('/list/category', Worker.getFilterTopviewByCategory);

// //* Dapps Home
// router.get('/home', MiddlewareServices.checkPublicRequest, Worker.getHome);
// router.get('/home/side', MiddlewareServices.checkPublicRequest, Worker.getHomeSide);
// router.get('/list', MiddlewareServices.checkPublicRequest, Worker.getFilterDapps);

// router.get('/home/chain/:chain', MiddlewareServices.checkPublicRequest, Worker.getHomeByChain);
// router.get('/list/view', MiddlewareServices.authorizationAPI, Worker.getFilterTopViewDapp);
// router.get('/info/:slug', MiddlewareServices.checkPublicRequest, Worker.getBySlug);
// router.get('/recommend', MiddlewareServices.authorizationAPI, Worker.getRecomendDapps);
// router.get('/home/suggest/:slug', MiddlewareServices.checkPublicRequest, Worker.getSuggestBySlug);

// //* Administrator
// router.get('/', MiddlewareServices.authorizationAPIAdmin, MiddlewareServices.authorizationAdmin, Worker.getAdmin);
// router.post('/', MiddlewareServices.authorizationAPIAdmin, MiddlewareServices.authorizationAdmin, Worker.postDapps);
// router.put('/pin/:id', MiddlewareServices.authorizationAPIAdmin, MiddlewareServices.authorizationAdmin, Worker.putPin);
// router.put('/', MiddlewareServices.authorizationAPIAdmin, MiddlewareServices.authorizationAdmin, Worker.putDapps);
// router.delete('/:id', MiddlewareServices.authorizationAPIAdmin, MiddlewareServices.authorizationAdmin, Worker.deleteDapps);

// //* Genre
// router.get('/genre/info/:id', MiddlewareServices.checkPublicRequest, Genre.getGenreBySlug);
// router.get('/genre', MiddlewareServices.checkPublicRequest, Genre.getGenre);

// //* GenreAdministrator
// router.get('/genre/admx', MiddlewareServices.authorizationAPIAdmin, MiddlewareServices.authorizationAdmin, Genre.getAdmin);
// router.post('/genre', MiddlewareServices.authorizationAPIAdmin, MiddlewareServices.authorizationAdmin, Genre.postGenre);
// router.put('/genre/pin/:id', MiddlewareServices.authorizationAPIAdmin, MiddlewareServices.authorizationAdmin, Genre.putPin);
// router.put('/genre', MiddlewareServices.authorizationAPIAdmin, MiddlewareServices.authorizationAdmin, Genre.putGenre);
// router.delete('/genre/:id', MiddlewareServices.authorizationAPIAdmin, MiddlewareServices.authorizationAdmin, Genre.deleteGenre);

// // Interaction
// router.get('/interaction/report', Worker.getInteractionReport);
// router.post('/interaction/open', MiddlewareServices.authorizationAPI, Interaction.addViewOpenDapps);

// // cronjob API
// router.get('/cacheView', Interaction.addViewToDB);

router.get('/list/category', Worker.getFilterTopviewByCategory);

//* Dapps Home
router.get('/home', Worker.getHome);
router.get('/home/side', Worker.getHomeSide);
router.get('/list', Worker.getFilterDapps);

router.get('/home/chain/:chain', Worker.getHomeByChain);
router.get('/list/view', Worker.getFilterTopViewDapp);
router.get('/info/:slug', Worker.getBySlug);
router.get('/recommend', Worker.getRecomendDapps);
router.get('/home/suggest/:slug', Worker.getSuggestBySlug);

//* Administrator
router.get('/', Worker.getAdmin);
router.post('/', Worker.postDapps);
router.put('/pin/:id', Worker.putPin);
router.put('/', Worker.putDapps);
router.delete('/:id', Worker.deleteDapps);

//* Genre
router.get('/genre/info/:id', Genre.getGenreBySlug);
router.get('/genre', Genre.getGenre);

//* GenreAdministrator
router.get('/genre/admx', Genre.getAdmin);
router.post('/genre', Genre.postGenre);
router.put('/genre/pin/:id', Genre.putPin);
router.put('/genre', Genre.putGenre);
router.delete('/genre/:id', Genre.deleteGenre);

// Interaction
router.get('/interaction/report', Worker.getInteractionReport);
router.post('/interaction/open', Interaction.addViewOpenDapps);

// cronjob API
router.get('/cacheView', Interaction.addViewToDB);

export default router;
