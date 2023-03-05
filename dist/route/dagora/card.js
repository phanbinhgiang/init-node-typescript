"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dagoraCard_1 = __importDefault(require("../../worker/dagora/dagoraCard"));
const router = express_1.default.Router();
router.get('/admx', dagoraCard_1.default.getFilterCardAdmin);
exports.default = router;
//# sourceMappingURL=card.js.map