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
/* eslint-disable no-return-await */
const User_1 = __importDefault(require("../../../model/user/User"));
class UserWorker {
    static getByListLocal(idList, filter) {
        return __awaiter(this, void 0, void 0, function* () {
            const payload = yield User_1.default.find({ id: { $in: idList } }, filter || null);
            return payload;
        });
    }
    static getByIdLocal(id, filter) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield User_1.default.findOne({ id }, filter);
        });
    }
}
exports.default = UserWorker;
//# sourceMappingURL=index.js.map