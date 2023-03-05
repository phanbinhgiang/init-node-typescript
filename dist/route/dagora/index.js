"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const card_1 = __importDefault(require("./card"));
const history_1 = __importDefault(require("./history"));
const router = express_1.default.Router();
router.use('/card', card_1.default);
router.use('/history', history_1.default);
exports.default = router;
//# sourceMappingURL=index.js.map