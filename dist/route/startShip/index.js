"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const startShip_1 = __importDefault(require("../../worker/startShip/startShip"));
const docs_json_1 = __importDefault(require("./docs.json"));
const router = express_1.default.Router();
// // dashboard
// router.use('/explore', StartShipWorker.explore);
// router.use('/detail/:id', StartShipWorker.getDetailBySlug);
// router.use('/register', StartShipWorker.register);
// router.use('/log', StartShipWorker.logRecord);
// router.use('/listing', StartShipWorker.listingAdmin);
// // router.use('/update', StartShipWorker.update);
// // router.use('/delete/:id', StartShipWorker.delete);
// migrate
router.use('/docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(docs_json_1.default));
// Get current pad list for user
router.get('/explore', startShip_1.default.explore);
router.get('/detail/:id', startShip_1.default.getDetailBySlug);
router.get('/register/signature', startShip_1.default.registerSignature);
router.post('/register', startShip_1.default.register);
router.post('/log', startShip_1.default.logRecord);
router.put('/admx', startShip_1.default.updateAdmin);
router.delete('/admx/:id', startShip_1.default.deleteAdmin);
router.post('/admx/listing', startShip_1.default.listingAdmin);
exports.default = router;
//# sourceMappingURL=index.js.map