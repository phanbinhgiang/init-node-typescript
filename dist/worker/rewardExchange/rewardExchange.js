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
/* eslint-disable function-paren-newline */
/* eslint-disable no-param-reassign */
/* eslint-disable no-underscore-dangle */
const GameContract_1 = __importDefault(require("../../model/game/GameContract"));
class RewardExchangeWorker {
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
            const listAwards = {
                dragonMaster: {
                    key: 'dragonMaster', requireExactAnimal: ['earthD', 'waterD', 'fireD', 'airD'], size: 4, maximum: 6000, amount: 5,
                },
                elementBender: {
                    key: 'elementBender', requireElement: ['water', 'fire', 'air', 'earth'], size: 4, maximum: 2800, amount: 8,
                },
                beastTamer: {
                    key: 'beastTamer', requireAnimal: ['D', 'U', 'T', 'P'], size: 4, maximum: 1200, amount: 15,
                },
                soulCharmer: {
                    key: 'soulCharmer', required: 'element', size: 4, maximum: 200, amount: 50,
                },
                theGreatEmperor: {
                    key: 'theGreatEmperor', required: 'full', maximum: 9999999, size: 16,
                },
            };
            const totalAwardExchangeRemainingData = Object.values(totalAwardExchangeData.reduce((result, item) => {
                result[`${item._id}Remaining`] = { type: item._id, count: listAwards[item._id].maximum - item.count };
                return result;
            }, {}));
            req.response = totalAwardExchangeRemainingData;
            next();
        });
    }
}
exports.default = RewardExchangeWorker;
//# sourceMappingURL=rewardExchange.js.map