"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const rewardExchange_1 = __importDefault(require("../../worker/rewardExchange/rewardExchange"));
const router = express_1.default.Router();
router.get('/', rewardExchange_1.default.getRewardExchange);
exports.default = router;
//# sourceMappingURL=rewardExchange.js.map