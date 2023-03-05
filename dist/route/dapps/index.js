"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable max-len */
const express_1 = __importDefault(require("express"));
const dapps_1 = __importDefault(require("../../worker/dapps"));
const genre_1 = __importDefault(require("../../worker/dapps/genre"));
const dappsInteraction_1 = __importDefault(require("../../worker/dapps/dappsInteraction"));
// import MiddlewareServices from '../../middleware';
const router = express_1.default.Router();
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
router.get('/list/category', dapps_1.default.getFilterTopviewByCategory);
//* Dapps Home
router.get('/home', dapps_1.default.getHome);
router.get('/home/side', dapps_1.default.getHomeSide);
router.get('/list', dapps_1.default.getFilterDapps);
router.get('/home/chain/:chain', dapps_1.default.getHomeByChain);
router.get('/list/view', dapps_1.default.getFilterTopViewDapp);
router.get('/info/:slug', dapps_1.default.getBySlug);
router.get('/recommend', dapps_1.default.getRecomendDapps);
router.get('/home/suggest/:slug', dapps_1.default.getSuggestBySlug);
//* Administrator
router.get('/', dapps_1.default.getAdmin);
router.post('/', dapps_1.default.postDapps);
router.put('/pin/:id', dapps_1.default.putPin);
router.put('/', dapps_1.default.putDapps);
router.delete('/:id', dapps_1.default.deleteDapps);
//* Genre
router.get('/genre/info/:id', genre_1.default.getGenreBySlug);
router.get('/genre', genre_1.default.getGenre);
//* GenreAdministrator
router.get('/genre/admx', genre_1.default.getAdmin);
router.post('/genre', genre_1.default.postGenre);
router.put('/genre/pin/:id', genre_1.default.putPin);
router.put('/genre', genre_1.default.putGenre);
router.delete('/genre/:id', genre_1.default.deleteGenre);
// Interaction
router.get('/interaction/report', dapps_1.default.getInteractionReport);
router.post('/interaction/open', dappsInteraction_1.default.addViewOpenDapps);
// cronjob API
router.get('/cacheView', dappsInteraction_1.default.addViewToDB);
exports.default = router;
//# sourceMappingURL=index.js.map