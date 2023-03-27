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
exports.createSlug = void 0;
/* eslint-disable no-shadow */
/* eslint-disable no-unused-vars */
/* eslint-disable consistent-return */
/* eslint-disable max-len */
const slug_1 = __importDefault(require("slug"));
const StartShipPad_1 = __importDefault(require("../../model/startship/StartShipPad"));
const StartShipParticipant_1 = __importDefault(require("../../model/startship/StartShipParticipant"));
const function_1 = require("../function");
const evmService_1 = __importDefault(require("../../service/evm/evmService"));
const function_2 = require("../../common/function");
const TYPE_OBJ = {
    sell: 'sell',
    claim: 'claim',
};
// ErrMessage
// padNotFound: Pad Not found
const SIGN_TYPE = 'starship';
const ERR_MESSAGE = {
    notInWhiteList: 'notInWhiteList',
    alreadyRegister: 'alreadyRegister',
    padNotFound: 'padNotFound',
    invalidHash: 'invalidHash',
};
const STARSHIP_FACTORY = {
    97: '0xe0C3d8D1dac3b6139a2fC5aD29Fb47d2C87cd053',
};
const createSlug = (text) => (0, slug_1.default)(text);
exports.createSlug = createSlug;
class StarshipServices {
    static explore(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { page = 1, size = 10, key, sort, } = req.query;
            const matchFind = key ? {
                $or: [
                    { 'information.name': { $regex: key, $options: 'i' } },
                    { 'information.description': { $regex: key, $options: 'i' } },
                ],
            } : {};
            const padList = yield StartShipPad_1.default.find(matchFind)
                .sort({ createdAt: -1 })
                .skip((parseInt(page) - 1) * parseInt(size)).limit(parseInt(size))
                .lean();
            // Count participant in here
            req.response = padList;
            next();
        });
    }
    static getDetailBySlug(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const payload = yield StartShipPad_1.default.findOne({ slug: id }).lean();
            req.response = payload || { errMess: ERR_MESSAGE.padNotFound };
            return next();
        });
    }
    static registerSignature(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { slug, chain } = req.query;
            const starShipPad = yield StartShipPad_1.default.findOne({ slug }, { _id: 0, contract: 1, whitelist: 1 });
            if (!starShipPad) {
                req.response = { errMess: ERR_MESSAGE.padNotFound };
                return next();
            }
            const whitelist = starShipPad.whitelist.split(';');
            if (whitelist.indexOf(req.address.toLowerCase()) === -1) {
                req.response = { errMess: ERR_MESSAGE.notInWhiteList };
                return next();
            }
            // const signature = await EVMServices.signWhiteList({
            //   contract: starShipPad.contract.address,
            //   chain,
            //   user: req.address,
            //   type: SIGN_TYPE,
            // });
            // req.response = signature;
            req.response = true;
            return next();
        });
    }
    static register(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { chain, id, hash } = req.body;
            const starShipPad = yield StartShipPad_1.default.findOne({ slug: id }, { _id: 0, contract: 1 });
            if (!starShipPad) {
                req.response = { errMess: ERR_MESSAGE.padNotFound };
                return next();
            }
            const txsDetail = yield evmService_1.default.getTxsByHashRequest(chain, hash);
            if (!txsDetail) {
                req.response = { errMess: ERR_MESSAGE.invalidHash };
                return next();
            }
            if ((0, function_2.convertCheckSUM)(txsDetail.to) !== starShipPad.contract.address) {
                req.response = { errMess: ERR_MESSAGE.invalidHash };
                return next();
            }
            const countJoined = yield StartShipParticipant_1.default.countDocuments({ id: slug_1.default, address: (0, function_2.convertCheckSUM)(req.address) });
            if (countJoined > 0) {
                req.response = { errMess: ERR_MESSAGE.alreadyRegister };
                return next();
            }
            yield StartShipParticipant_1.default.create({
                id: slug_1.default, address: (0, function_2.convertCheckSUM)(req.address), chain, register: { hash },
            });
            req.response = true;
            next();
        });
    }
    static logRecord(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            // body address,chain,id ,type,hash,amount
            // model starship participant
            // checkExists
            // not Exists errMess = notRegister
            // type Claim check old Claimed Data if exist data => errMess: alreadyClaim
            // type Sell update data sell push hash and amount=>update
            // Need onchain signature
            const { chain, id, hash, type = TYPE_OBJ.sell, amount, } = req.body;
            // const detailTxs = await EVMServices.getTxsByHash(chain, hash)
            // if (!detailTxs) {
            //   req.response = { errMess: 'TxsNotFound' }
            //   return next()
            // }
            // if (convertSUM(detailTxs.to) !== CONTRACT_CHECK) {
            //   req.response = { errMess: 'contractInvalid' }
            //   return next()
            // }
            // const findStartShipParticipantData = await StartShipParticipant.findOne({ id, chain, address })
            // if (!findStartShipParticipantData) {
            //   req.response = { errMess: 'notRegister' }
            //   return next()
            // }
            // if (!TYPE_OBJ[type]) {
            //   req.response = { errMess: 'typeErr' }
            //   return next()
            // }
            // if (TYPE_OBJ[type] === TYPE_OBJ.sell) {
            //   const currentHash = findStartShipParticipantData.sell.hash
            //   const currentAmount = findStartShipParticipantData.sell.amount
            //   await findStartShipParticipantData.update({
            //     sell:
            //       { hash: [...currentHash, hash], amount: [...currentAmount, amount] }
            //   })
            //   req.response = true
            //   next()
            // }
            // if (TYPE_OBJ[type] === TYPE_OBJ.claim) {
            //   const findClaim = findStartShipParticipantData.claim
            //   if (findClaim?.hash && findClaim?.amount) {
            //     req.response = { errMess: 'alreadyClaim' }
            //     return next()
            //   }
            //   await findStartShipParticipantData.update({
            //     claim: { hash, amount }
            //   })
            //   req.response = true
            //   next()
            // }
            // check hash to === ''
        });
    }
    static listingAdmin(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { hash, chainId, information, content, token0, token1, contract, date, status, social, isPrivate, whitelist, isActive, } = req.body;
            const genSlug = (0, exports.createSlug)(information.name);
            if (!genSlug) {
                return next();
            }
            const findStarshipPadData = yield StartShipPad_1.default.countDocuments({ slug: genSlug });
            if (findStarshipPadData) {
                req.response = { errMess: 'slugExists' };
                return next();
            }
            const newData = {
                slug: genSlug,
                hash,
                chainId,
                information,
                content,
                token0,
                token1,
                contract,
                date,
                status,
                social,
                isPrivate,
                whitelist,
                isActive,
            };
            yield StartShipPad_1.default.create(newData);
            req.response = true;
            next();
        });
    }
    static updateAdmin(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.body;
            const updatedFiled = (0, function_1.genUpdate)(req.body, ['information', 'content', 'token0', 'token1', 'social']);
            StartShipPad_1.default.findOneAndUpdate({ _id: id }, updatedFiled, { new: true }, (err, result) => {
                if (!err || result) {
                    req.response = result;
                    next();
                }
                else {
                    req.response = false;
                    next();
                }
            });
        });
    }
    static deleteAdmin(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const payload = yield StartShipPad_1.default.findOne({ _id: id }, { _id: 1 });
            if (!payload) {
                req.response = { errMess: 'padNotFound' };
                return next();
            }
            yield payload.updateOne({ isActive: false });
            req.response = true;
            next();
        });
    }
}
exports.default = StarshipServices;
//# sourceMappingURL=startShip.js.map