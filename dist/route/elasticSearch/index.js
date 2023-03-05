"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const elasticSearch_1 = __importDefault(require("../../worker/elasticSearch/elasticSearch"));
const router = express_1.default.Router();
router.use('/', elasticSearch_1.default.queryElasticSearch);
exports.default = router;
//# sourceMappingURL=index.js.map