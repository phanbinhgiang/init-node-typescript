"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const startShip_1 = __importDefault(require("../../worker/startShip/startShip"));
const router = express_1.default.Router();
// dashboard
router.use('/explore', startShip_1.default.explore);
router.use('/explore/:id', startShip_1.default.getDetailBySlug);
router.use('/register', startShip_1.default.register);
router.use('/log', startShip_1.default.logRecord);
router.use('/listing', startShip_1.default.listingAdmin);
exports.default = router;
//# sourceMappingURL=index.js.map