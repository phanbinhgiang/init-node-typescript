"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const function_1 = require("../../common/function");
const DagoraCard_1 = __importDefault(require("../../model/dagora/DagoraCard"));
class DagoraCardWorker {
    static getFilterCardAdmin(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { keyword, chain, genre, page = 1, size = 20, } = req.query;
            console.log('🚀 ~ file: dagoraCard.ts:8 ~ DagoraCardWorker ~ getFilterCardAdmin ~ keyword', keyword);
            const matchState = {};
            if ((0, function_1.getLength)(keyword) > 0) {
                matchState.name = { $regex: `.*${keyword}.*`, $options: 'i' };
            }
            if ((0, function_1.getLength)(chain) > 0) {
                matchState.chain = chain;
            }
            if ((0, function_1.getLength)(genre) > 0) {
                matchState.genre = genre;
            }
            const payload = yield DagoraCard_1.default.find(matchState).sort({ createdAt: -1 })
                .skip((0, function_1.genSkipNum)(page, size)).limit(parseInt(size));
            const total = yield DagoraCard_1.default.countDocuments(matchState);
            req.response = {
                data: payload,
                total,
                totalPage: Math.ceil(total / size),
                currPage: parseInt(page),
            };
            next();
        });
    }
}
exports.default = DagoraCardWorker;
//# sourceMappingURL=dagoraCard.js.map