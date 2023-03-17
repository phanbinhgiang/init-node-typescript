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
/* eslint-disable consistent-return */
/* eslint-disable max-len */
const slug_1 = __importDefault(require("slug"));
const StartShipPad_1 = __importDefault(require("../../model/startship/StartShipPad"));
const StartShipParticipant_1 = __importDefault(require("../../model/startship/StartShipParticipant"));
const function_1 = require("../../common/function");
const TYPE_OBJ = {
    sell: 'sell',
    claim: 'claim',
};
const CONTRACT_CHECK = '0x7B11a60E3Fbe021dD3faa48B49598B7Ff0C667A4';
const createSlug = (text) => (0, slug_1.default)(text);
exports.createSlug = createSlug;
class StarshipServices {
    // get list statshipPad
    // createdAt:-1
    // stashipPad
    static explore(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { page = 1, size = 10, key, } = req.query;
            const matchFind = key ? {
                $or: [
                    { 'information.name': { $regex: key, $options: 'i' } },
                    { 'information.description': { $regex: key, $options: 'i' } },
                ],
            } : {};
            const statShipPadData = yield StartShipPad_1.default.find(matchFind)
                .sort({ createdAt: -1, 'token0.price': -1, 'token1.price': -1 })
                .skip((parseInt(page) - 1) * parseInt(size)).limit(parseInt(size))
                .lean();
            req.response = statShipPadData;
            next();
        });
    }
    // search key words, sort by (time, price)
    // stashipPad
    // get Find One
    static getDetailBySlug(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const findStatShipPadData = yield StartShipPad_1.default.findOne({ slug: id }).lean();
            req.response = findStatShipPadData;
            next();
        });
    }
    static register(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            // body chain,id,address,registerHash
            // create DAta
            // model startshipparticipant
            // check Exists by address and id
            //  if Exists =>req.response = {errMess:"alreadyRegister"}
            // return next()
            const { chain, id, address, hash, } = req.body;
            const findStartShipParticipantData = yield StartShipParticipant_1.default.countDocuments({ id, chain, address });
            if (findStartShipParticipantData) {
                req.response = { errMess: 'alreadyRegister' };
                return next();
            }
            yield StartShipParticipant_1.default.create({
                id, address, chain, register: { hash },
            });
            req.response = true;
            next();
            //
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
            const { chain, id, address, hash, type = TYPE_OBJ.sell, amount, } = req.body;
            if ((0, function_1.convertCheckSUM)(hash) !== CONTRACT_CHECK) {
                req.response = { errMess: 'contract invalid' };
                return next();
            }
            const findStartShipParticipantData = yield StartShipParticipant_1.default.findOne({ id, chain, address });
            if (!findStartShipParticipantData) {
                req.response = { errMess: 'notRegister' };
                return next();
            }
            if (!TYPE_OBJ[type]) {
                req.response = { errMess: 'typeErr' };
                return next();
            }
            if (TYPE_OBJ[type] === TYPE_OBJ.sell) {
                const currentHash = findStartShipParticipantData.sell.hash;
                const currentAmount = findStartShipParticipantData.sell.amount;
                yield findStartShipParticipantData.update({
                    sell: { hash: [...currentHash, hash], amount: [...currentAmount, amount] },
                });
                req.response = true;
                next();
            }
            if (TYPE_OBJ[type] === TYPE_OBJ.claim) {
                const findClaim = findStartShipParticipantData.claim;
                if ((findClaim === null || findClaim === void 0 ? void 0 : findClaim.hash) && (findClaim === null || findClaim === void 0 ? void 0 : findClaim.amount)) {
                    req.response = { errMess: 'alreadyClaim' };
                    return next();
                }
                yield findStartShipParticipantData.update({
                    claim: { hash, amount },
                });
                req.response = true;
                next();
            }
            // check hash to === ''
        });
    }
    static listingAdmin(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            // create StashipPad
            // slug gen from infomation.name by function
            // check slug exist if exist => show errMess slugExists
            const { information, contract } = req.body;
            if ((0, function_1.convertCheckSUM)(contract.address) !== CONTRACT_CHECK) {
                req.response = { errMess: 'contract invalid' };
                return next();
            }
            const genSlug = (0, exports.createSlug)(information.name);
            if (!genSlug) {
                return next();
            }
            const findStartShipPadData = yield StartShipPad_1.default.countDocuments({ slug: genSlug });
            if (findStartShipPadData) {
                req.response = { errMess: 'slugExists' };
                return next();
            }
            yield StartShipPad_1.default.create(Object.assign(Object.assign({}, req.body), { slug: genSlug }));
            req.response = true;
            next();
        });
    }
    static update(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { information } = req.body;
            const genSlug = (0, exports.createSlug)(information.name);
            if (!genSlug) {
                return next();
            }
            const findStartShipPadData = yield StartShipPad_1.default.findOne({ slug: genSlug });
            if (!findStartShipPadData) {
                req.response = { errMess: 'not found document' };
                return next();
            }
            yield findStartShipPadData.update(req.body);
            req.response = true;
            next();
        });
    }
    static delete(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { slug: genSlug } = req.params;
            const findStartShipPadData = yield StartShipPad_1.default.findOne({ slug: genSlug });
            if (!findStartShipPadData) {
                req.response = { errMess: 'not found document' };
                return next();
            }
            if (!findStartShipPadData.isActive) {
                req.response = { errMess: 'document is deleted' };
                return next();
            }
            yield findStartShipPadData.update({ isActive: false });
            req.response = true;
            next();
        });
    }
}
exports.default = StarshipServices;
//# sourceMappingURL=startShip.js.map