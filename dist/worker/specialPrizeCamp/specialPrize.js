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
/* eslint-disable no-param-reassign */
/* eslint-disable no-underscore-dangle */
const GameContract_1 = __importDefault(require("../../model/game/GameContract"));
class SpecialPrizeWorker {
    static getSpecialPrize(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.size) || 10;
            const skip = (page - 1) * limit;
            const totalRewardsData = yield GameContract_1.default.aggregate([
                {
                    $match: {
                        'values.id': 'theGreatEmperor',
                    },
                },
                {
                    $project: {
                        _id: 0, owner: 1, createdAt: 1,
                    },
                },
                {
                    $lookup: {
                        from: 'users',
                        let: { id_owner: '$owner' },
                        pipeline: [
                            {
                                $match: { $expr: { $eq: ['$id', '$$id_owner'] } },
                            },
                            {
                                $project: { _id: 0, refId: 1 },
                            },
                        ],
                        as: 'ref',
                    },
                },
                {
                    $unwind: '$ref',
                },
                {
                    $sort: { createdAt: -1 },
                },
                {
                    $skip: skip,
                },
                {
                    $limit: limit,
                },
            ]);
            const dataResponse = totalRewardsData.map((item) => ({
                user: item.owner,
                referralReward: item.ref.refId,
                numberOfAnimal: 16,
                time: item.createdAt,
            }));
            req.response = dataResponse;
            next();
        });
    }
    static getRewardExchange(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const totalAwardExchangeData = yield GameContract_1.default.aggregate([
                {
                    $match: {
                        'values.id': {
                            $in: ['dragonMaster', 'elementBender', 'beastTamer', 'soulCharmer'],
                        },
                    },
                },
                {
                    $group: {
                        _id: '$values.id',
                        count: { $sum: 1 },
                    },
                },
            ]);
            const totalAwardExchangeRemainingData = totalAwardExchangeData.map((item) => {
                if (item._id === 'dragonMaster') {
                    item.count = 6000 - item.count;
                }
                if (item._id === 'beastTamer') {
                    item.count = 1200 - item.count;
                }
                if (item._id === 'soulCharmer') {
                    item.count = 200 - item.count;
                }
                if (item._id === 'elementBender') {
                    item.count = 2800 - item.count;
                }
                return item;
            });
            req.response = totalAwardExchangeRemainingData;
            next();
        });
    }
}
exports.default = SpecialPrizeWorker;
//# sourceMappingURL=specialPrize.js.map