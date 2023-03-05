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
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable max-len */
/* eslint-disable consistent-return */
const moment_1 = __importDefault(require("moment"));
const crypto_js_1 = __importDefault(require("crypto-js"));
const get_1 = __importDefault(require("lodash/get"));
const query_string_1 = __importDefault(require("query-string"));
const function_1 = require("../worker/function");
const constants_1 = require("./constants");
const function_2 = require("../common/function");
const User_1 = __importDefault(require("../model/user/User"));
class MiddlewareServices {
    static checkPublicRequest(req, res, next) {
        if (req.get('Signature') === 'undefined' || req.get('Signature') === undefined
            || req.get('Accept') === 'undefined' || req.get('Accept') === undefined
            || req.get('Version') === 'undefined' || req.get('Version') === undefined
            || req.get('Source') === 'undefined' || req.get('Source') === undefined) {
            return res.status(404).send('Your requested URL not found');
        }
        return next();
    }
    static authorizationAPI(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!req.get('authorization'))
                return res.status(404).send(constants_1.mess404);
            const checkSignature = (user, userAddress) => {
                const stringSignature = req.get('signature');
                let passwordHash;
                if (req.method !== 'GET' && req.method !== 'DELETE') {
                    passwordHash = JSON.stringify(req.body);
                }
                else {
                    const lengthObject = Object.keys(req.query).length;
                    passwordHash = lengthObject > 0 ? query_string_1.default.stringify(req.query) : {};
                }
                const hashKey = '0xaeb0325a6789f597b4f7c2c4dcb36b1ba4232384ffaf7b24670b71dafc564cec';
                const hashPassword = crypto_js_1.default.HmacSHA256(passwordHash, hashKey).toString();
                if (hashPassword === stringSignature || ((0, function_1.getLength)(Object.keys(req.query)) === 0 && crypto_js_1.default.HmacSHA256(query_string_1.default.stringify({}), hashKey).toString())) {
                    req.user = user;
                    req.userAddress = userAddress;
                    return next();
                }
                res.status(404).send(constants_1.mess404);
            };
            const tokenAuthen = req.get('authorization').replace('Bearer ', '');
            const decodeToken = function_2.CommonServices.decodeToken(tokenAuthen);
            // Expired token
            if ((0, moment_1.default)().unix() > (0, get_1.default)(decodeToken, 'exp')) {
                return res.status(401).send(constants_1.mess401);
            }
            if (function_2.CommonServices.verifyToken(tokenAuthen, process.env.SECRET_TOKEN_APDATER)) {
                const user = (0, function_2.lowerCase)(decodeToken.id);
                const userAddress = decodeToken.id;
                const getBlock = yield (0, function_1.getStorage)('BLOCK_USER');
                if ((0, function_1.getLength)(getBlock) > 0 && getBlock.includes(user))
                    return res.status(404).send(constants_1.mess404);
                if (!(0, function_2.validateEmailRule)(user))
                    return res.status(404).send(constants_1.mess404);
                checkSignature(user, userAddress);
            }
            else {
                res.status(404).send(constants_1.mess404);
            }
        });
    }
    static authorizationAPIAdmin(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!req.get('authorization'))
                return res.status(404).send(constants_1.mess404);
            const tokenAuthen = req.get('authorization').replace('Bearer ', '');
            const decodeToken = function_2.CommonServices.decodeToken(tokenAuthen);
            // Expired token
            if ((0, moment_1.default)().unix() > (0, get_1.default)(decodeToken, 'exp')) {
                return res.status(401).send(constants_1.mess401);
            }
            if (function_2.CommonServices.verifyToken(tokenAuthen, process.env.SECRET_TOKEN_APDATER)) {
                const user = (0, function_2.lowerCase)(decodeToken.id);
                const getBlock = yield (0, function_1.getStorage)('BLOCK_USER');
                if ((0, function_1.getLength)(getBlock) > 0 && getBlock.includes(user))
                    return res.status(404).send(constants_1.mess404);
                if (!(0, function_2.validateEmailRule)(user))
                    return res.status(404).send(constants_1.mess404);
                req.user = user;
                next();
            }
            else {
                res.status(404).send(constants_1.mess404);
            }
        });
    }
    static authorizationAdmin(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!req.user)
                return res.status(404).send(constants_1.mess404);
            const user = yield User_1.default.findOne({ id: req.user }, { role: 1, _id: 0 });
            if (!user)
                return res.status(404).send(constants_1.mess404);
            if (user.role !== constants_1.userRole.member)
                return next();
        });
    }
}
exports.default = MiddlewareServices;
//# sourceMappingURL=index.js.map