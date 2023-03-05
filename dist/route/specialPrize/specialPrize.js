"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const specialPrize_1 = __importDefault(require("../../worker/specialPrizeCamp/specialPrize"));
const router = express_1.default.Router();
router.get('/', specialPrize_1.default.getSpecialPrize);
exports.default = router;
//# sourceMappingURL=specialPrize.js.map