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
exports.convertDateMoment = void 0;
/* eslint-disable import/order */
/* eslint-disable max-len */
/* eslint-disable object-curly-newline */
/* eslint-disable no-label-var */
/* eslint-disable dot-notation */
/* eslint-disable no-return-assign */
/* eslint-disable no-param-reassign */
/* eslint-disable no-underscore-dangle */
const GameContract_1 = __importDefault(require("../../model/game/GameContract"));
const GameNFTs_1 = __importDefault(require("../../model/game/GameNFTs"));
const participant_1 = __importDefault(require("../../model/participant/participant"));
const PointUser_1 = __importDefault(require("../../model/user/PointUser"));
const User_1 = __importDefault(require("../../model/user/User"));
const lodash_1 = require("lodash");
const moment_1 = __importDefault(require("moment"));
const convertDateMoment = (date, type) => {
    const dateFormat = new Date(date);
    const strTime = (0, moment_1.default)(dateFormat).format(type);
    return strTime;
};
exports.convertDateMoment = convertDateMoment;
class CampaignWorker {
    static getTotalDataLocal(from, to) {
        return __awaiter(this, void 0, void 0, function* () {
            const totalPlayersPromise = participant_1.default.countDocuments({
                campaign: 'newyear2023',
                createdAt: {
                    $gte: new Date(parseFloat(from)),
                    $lte: new Date(parseFloat(to)),
                },
            }).lean();
            const totalBurnedXPromise = PointUser_1.default.aggregate([
                {
                    $match: {
                        type: 'worldcup2022',
                        createdAt: {
                            $gte: new Date(parseFloat(from)),
                            $lte: new Date(parseFloat(to)),
                        },
                        amount: { $lt: 0 },
                    },
                },
                {
                    $group: {
                        _id: null,
                        count: { $sum: '$amount' },
                    },
                },
            ]);
            const totalFortuneChestByPlayHongBaoPromise = GameNFTs_1.default.countDocuments({
                id: 'fortunechest',
                createdAt: {
                    $gte: new Date(parseFloat(from)),
                    $lte: new Date(parseFloat(to)),
                },
            }).lean();
            const totalTreasureChestBoughtPromise = GameNFTs_1.default.countDocuments({
                id: 'treasurechest',
                createdAt: {
                    $gte: new Date(parseFloat(from)),
                    $lte: new Date(parseFloat(to)),
                },
            }).lean();
            const totalTreasureChestOpenPromise = GameNFTs_1.default.countDocuments({
                id: 'treasurechest',
                createdAt: {
                    $gte: new Date(parseFloat(from)),
                    $lte: new Date(parseFloat(to)),
                },
                'ids.0': { $exists: true },
            }).lean();
            const totalFortuneChestOpenPromise = GameNFTs_1.default.countDocuments({
                id: 'fortunechest',
                createdAt: {
                    $gte: new Date(parseFloat(from)),
                    $lte: new Date(parseFloat(to)),
                },
                'ids.0': { $exists: true },
            }).lean();
            const totalDynastyChestOpenPromise = GameNFTs_1.default.countDocuments({
                id: 'dynastychest',
                createdAt: {
                    $gte: new Date(parseFloat(from)),
                    $lte: new Date(parseFloat(to)),
                },
                'ids.0': { $exists: true },
            }).lean();
            const totalCoin98ChestOpenPromise = GameNFTs_1.default.countDocuments({
                id: 'coin98chest',
                createdAt: {
                    $gte: new Date(parseFloat(from)),
                    $lte: new Date(parseFloat(to)),
                },
                'ids.0': { $exists: true },
            }).lean();
            const totalChestSentPromise = GameNFTs_1.default.countDocuments({
                createdAt: {
                    $gte: new Date(parseFloat(from)),
                    $lte: new Date(parseFloat(to)),
                },
                pointOwner: { $exists: true, $ne: '' },
                id: { $in: ['treasurechest', 'fortunechest', 'dynastychest', 'coin98chest', 'evolveChest'] },
            }).lean();
            const totalAnimalSentPromise = GameNFTs_1.default.countDocuments({
                createdAt: {
                    $gte: new Date(parseFloat(from)),
                    $lte: new Date(parseFloat(to)),
                },
                pointOwner: { $exists: true, $ne: '' },
                id: { $in: ['treasurechest', 'fortunechest', 'dynastychest', 'coin98chest', 'evolveChest'] },
                'ids.0': { $exists: true },
            }).lean();
            const totalUserLanguagePromise = participant_1.default.aggregate([
                {
                    $match: {
                        createdAt: {
                            $gte: new Date(parseFloat(from)),
                            $lte: new Date(parseFloat(to)),
                        },
                    },
                },
                {
                    $group: {
                        _id: '$lang',
                        count: { $sum: 1 },
                    },
                },
            ]);
            const itemRewardsPromise = GameContract_1.default.aggregate([
                {
                    $match: {
                        createdAt: {
                            $gte: new Date(parseFloat(from)),
                            $lte: new Date(parseFloat(to)),
                        },
                        'values.id': {
                            $in: ['dragonMaster', 'elementBender', 'beastTamer', 'soulCharmer', 'theGreatEmperor'],
                        },
                    },
                },
                {
                    $group: {
                        _id: '$values.id',
                        count: { $sum: '$values.amount' },
                    },
                },
            ]);
            const totalAnimalsEvolvePromise = GameNFTs_1.default.aggregate([
                {
                    $match: {
                        createdAt: {
                            $gte: new Date(parseFloat(from)),
                            $lte: new Date(parseFloat(to)),
                        },
                        ids: {
                            $in: ['earthD', 'waterD', 'fireD', 'airD', 'earthU', 'waterU', 'fireU', 'airU'],
                        },
                    },
                },
                {
                    $group: {
                        _id: { $first: '$ids' },
                        count: { $sum: 1 },
                    },
                },
            ]);
            const totalFortuneChestByBoughtCombo10Promise = GameNFTs_1.default.countDocuments({ id: 'fortunechest', point: 10 });
            const [totalPlayers, totalBurnedX, totalFortuneChestByPlayHongBao, totalTreasureChestBought, totalTreasureChestOpen, totalFortuneChestOpen, totalDynastyChestOpen, totalCoin98ChestOpen, totalChestSent, totalAnimalSent, totalUserLanguage, itemRewards, totalAnimalsEvolve, totalFortuneChestByBoughtCombo10,] = yield Promise.all([
                totalPlayersPromise,
                totalBurnedXPromise,
                totalFortuneChestByPlayHongBaoPromise,
                totalTreasureChestBoughtPromise,
                totalTreasureChestOpenPromise,
                totalFortuneChestOpenPromise,
                totalDynastyChestOpenPromise,
                totalCoin98ChestOpenPromise,
                totalChestSentPromise,
                totalAnimalSentPromise,
                totalUserLanguagePromise,
                itemRewardsPromise,
                totalAnimalsEvolvePromise,
                totalFortuneChestByBoughtCombo10Promise,
            ]);
            const totalRewards = itemRewards.reduce((result, item) => result += item.count, 0);
            const totalDragonEvolve = totalAnimalsEvolve.reduce((result, item) => {
                const listDragonEvolve = ['earthD', 'waterD', 'fireD', 'airD'];
                if (listDragonEvolve.includes(item._id)) {
                    result += item.count;
                }
                return result;
            }, 0);
            const totalUnicornEvolve = totalAnimalsEvolve.reduce((result, item) => {
                const listDragonEvolve = ['earthU', 'waterU', 'fireU', 'airU'];
                if (listDragonEvolve.includes(item._id)) {
                    result += item.count;
                }
                return result;
            }, 0);
            const response = {
                totalDragonEvolve,
                totalUnicornEvolve,
                totalRewards,
                totalPlayers,
                totalBurnedX: totalBurnedX[0].count,
                totalFortuneChestByPlayHongBao,
                totalFortuneChestByBoughtCombo10,
                totalTreasureChestBought,
                totalTreasureChestOpen,
                totalFortuneChestOpen,
                totalDynastyChestOpen,
                totalCoin98ChestOpen,
                totalChestSent,
                totalAnimalSent,
                totalUserLanguageENG: (0, lodash_1.get)(totalUserLanguage.find((item) => item._id === 'en'), 'count', 0),
                totalUserLanguageVi: (0, lodash_1.get)(totalUserLanguage.find((item) => item._id === 'vi'), 'count', 0),
                totalUserLanguageRUS: (0, lodash_1.get)(totalUserLanguage.find((item) => item._id === 'rus'), 'count', 0),
                totalUserLanguageCN: (0, lodash_1.get)(totalUserLanguage.find((item) => item._id === 'cn'), 'count', 0),
                totalUserLanguageGlobal: (0, lodash_1.get)(totalUserLanguage.find((item) => item._id === 'global'), 'count', 0),
            };
            return response;
        });
    }
    static getAnimalsDataLocal(from, to) {
        return __awaiter(this, void 0, void 0, function* () {
            const totalAnimalData = yield GameNFTs_1.default.aggregate([
                {
                    $match: {
                        createdAt: {
                            $gte: new Date(parseFloat(from)),
                            $lte: new Date(parseFloat(to)),
                        },
                        ids: {
                            $in: ['earthD', 'earthU', 'earthT', 'earthP',
                                'waterD', 'waterU', 'waterT', 'waterP',
                                'fireD', 'fireU', 'fireT', 'fireP',
                                'airD', 'airU', 'airT', 'airP'],
                        },
                    },
                },
                {
                    $group: {
                        _id: { $first: '$ids' },
                        count: { $sum: 1 },
                    },
                },
            ]);
            return {
                totalEarthDragon: (0, lodash_1.get)(totalAnimalData.find((item) => item._id === 'earthD'), 'count', 0),
                totalEarthUnicorn: (0, lodash_1.get)(totalAnimalData.find((item) => item._id === 'earthU'), 'count', 0),
                totalEarthTurtle: (0, lodash_1.get)(totalAnimalData.find((item) => item._id === 'earthT'), 'count', 0),
                totalEarthPhoenix: (0, lodash_1.get)(totalAnimalData.find((item) => item._id === 'earthP'), 'count', 0),
                totalWaterDragon: (0, lodash_1.get)(totalAnimalData.find((item) => item._id === 'waterD'), 'count', 0),
                totalWaterUnicorn: (0, lodash_1.get)(totalAnimalData.find((item) => item._id === 'waterU'), 'count', 0),
                totalWaterTurtle: (0, lodash_1.get)(totalAnimalData.find((item) => item._id === 'waterT'), 'count', 0),
                totalWaterPhoenix: (0, lodash_1.get)(totalAnimalData.find((item) => item._id === 'waterP'), 'count', 0),
                totalFireDragon: (0, lodash_1.get)(totalAnimalData.find((item) => item._id === 'fireD'), 'count', 0),
                totalFireUnicorn: (0, lodash_1.get)(totalAnimalData.find((item) => item._id === 'fireU'), 'count', 0),
                totalFireTurtle: (0, lodash_1.get)(totalAnimalData.find((item) => item._id === 'fireT'), 'count', 0),
                totalFirePhoenix: (0, lodash_1.get)(totalAnimalData.find((item) => item._id === 'fireP'), 'count', 0),
                totalAirDragon: (0, lodash_1.get)(totalAnimalData.find((item) => item._id === 'airD'), 'count', 0),
                totalAirUnicorn: (0, lodash_1.get)(totalAnimalData.find((item) => item._id === 'airU'), 'count', 0),
                totalAirTurtle: (0, lodash_1.get)(totalAnimalData.find((item) => item._id === 'airT'), 'count', 0),
                totalAirPhoenix: (0, lodash_1.get)(totalAnimalData.find((item) => item._id === 'airP'), 'count', 0),
            };
        });
    }
    static getRewardsSummaryLocal(from, to) {
        return __awaiter(this, void 0, void 0, function* () {
            const totalRewards = yield GameContract_1.default.aggregate([
                {
                    $match: {
                        createdAt: {
                            $gte: new Date(parseFloat(from)),
                            $lte: new Date(parseFloat(to)),
                        },
                        'values.id': {
                            $in: ['dragonMaster', 'elementBender', 'beastTamer', 'soulCharmer', 'theGreatEmperor'],
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
            const response = {
                totalDragonMasterRewards: (0, lodash_1.get)(totalRewards.find((item) => item._id === 'dragonMaster'), 'count', 0),
                totalElementBenderRewards: (0, lodash_1.get)(totalRewards.find((item) => item._id === 'elementBender'), 'count', 0),
                totalBeastTamerRewards: (0, lodash_1.get)(totalRewards.find((item) => item._id === 'beastTamer'), 'count', 0),
                totalSoulCharmerRewards: (0, lodash_1.get)(totalRewards.find((item) => item._id === 'soulCharmer'), 'count', 0),
                totalTheGreatEmperorRewards: (0, lodash_1.get)(totalRewards.find((item) => item._id === 'theGreatEmperor'), 'count', 0),
            };
            return response;
        });
    }
    static getDetailRewardsLocal(from, to) {
        return __awaiter(this, void 0, void 0, function* () {
            const rewardPayload = yield GameContract_1.default.find({
                createdAt: {
                    $gte: new Date(parseFloat(from)),
                    $lte: new Date(parseFloat(to)),
                },
                'values.id': {
                    $in: ['dragonMaster', 'elementBender', 'beastTamer', 'soulCharmer'],
                },
            }, 'owner values createdAt').lean();
            const listEmails = rewardPayload.map((item) => item['owner']).filter((value, index, self) => self.indexOf(value) === index);
            const userPayload = yield User_1.default.find({
                id: { $in: listEmails },
            }, 'id name refId').lean();
            const ParticipantPayload = yield participant_1.default.find({
                campaign: 'newyear2023',
                user: { $in: listEmails },
            }, 'id user').lean();
            const pointUserPayload = yield PointUser_1.default.aggregate([
                {
                    $match: {
                        createdAt: {
                            $gte: new Date(parseFloat(from)),
                            $lte: new Date(parseFloat(to)),
                        },
                        amount: { $lt: 0 },
                        createdUser: { $in: listEmails },
                    },
                },
                {
                    $project: { createdUser: 1, amount: 1 },
                },
                {
                    $group: {
                        _id: '$createdUser',
                        amount: { $sum: '$amount' },
                    },
                },
            ]);
            const listAwards = {
                dragonMaster: { key: 'dragonMaster', requireExactAnimal: ['earthD', 'waterD', 'fireD', 'airD'], size: 4, maximum: 6000, amount: 5 },
                elementBender: { key: 'elementBender', requireElement: ['water', 'fire', 'air', 'earth'], size: 4, maximum: 2800, amount: 8 },
                beastTamer: { key: 'beastTamer', requireAnimal: ['D', 'U', 'T', 'P'], size: 4, maximum: 1200, amount: 15 },
                soulCharmer: { key: 'soulCharmer', required: 'element', size: 4, maximum: 200, amount: 50 },
            };
            const dataResponse = rewardPayload.map((item) => {
                const userData = userPayload.find((user) => user['id'] === item['owner']);
                const addressData = ParticipantPayload.find((address) => address['user'] === item['owner']);
                const usedXPointUserAmountData = pointUserPayload.find((pointUser) => pointUser._id === item['owner']);
                item['id'] = item['owner'];
                item['time'] = (0, exports.convertDateMoment)(item['createdAt'], 'hh-mm DD-MM-YYYY');
                item['amount'] = listAwards[item['values'].id].amount;
                item['name'] = userData ? userData['name'] : '';
                item['refId'] = userData ? userData['refId'] : '';
                item['address'] = addressData['id'].replace('newyear2023', '');
                item['prize'] = item['values'].id;
                item['usedXPointUserAmount'] = Math.abs(usedXPointUserAmountData.amount);
                return item;
            });
            return dataResponse;
        });
    }
    static getDetailUsersLocal(from, to) {
        return __awaiter(this, void 0, void 0, function* () {
            const totalUsersData = yield participant_1.default.aggregate([
                {
                    $match: {
                        createdAt: {
                            $gte: new Date(parseFloat(from)),
                            $lte: new Date(parseFloat(to)),
                        },
                    },
                },
                {
                    $project: { _id: 0, user: 1 },
                },
                {
                    $lookup: {
                        from: 'users',
                        let: { id_user: '$user' },
                        pipeline: [
                            {
                                $match: { $expr: { $eq: ['$id', '$$id_user'] } },
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
                    $lookup: {
                        from: 'pointusers',
                        let: { id_user: '$user' },
                        pipeline: [
                            {
                                $match: { $expr: { $eq: ['$createdUser', '$$id_user'] } },
                            },
                            {
                                $project: { _id: 0, amount: 1, createdAt: 1 },
                            },
                        ],
                        as: 'amountXBurn',
                    },
                },
            ]);
            const dataUserDetail = totalUsersData.map((item) => {
                const totalXBurn = Math.abs(item.amountXBurn.reduce((sum, index) => {
                    if (index.amount < 0) {
                        sum += index.amount;
                    }
                    return sum;
                }, 0));
                const totalXBurnDate27month1 = Math.abs(item.amountXBurn.reduce((sum, index) => {
                    if (index.amount < 0 && index.createdAt >= new Date('2023-01-27') && index.createdAt < new Date('2023-01-28')) {
                        sum += index.amount;
                    }
                    return sum;
                }, 0));
                return { email: item.user, ref: item.ref.refId, totalXBurn, totalXBurnDate27month1 };
            });
            const uniqueIds = [];
            const response = dataUserDetail.filter((element) => {
                const isDuplicate = uniqueIds.includes(element.email);
                if (!isDuplicate) {
                    uniqueIds.push(element.email);
                    return true;
                }
                return false;
            });
            return response;
        });
    }
    static getDataCampaign(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { from, to, type, } = req.query;
            const data = yield CampaignWorker[type](from, to);
            req.response = data;
            next();
        });
    }
}
exports.default = CampaignWorker;
//# sourceMappingURL=campTestReport.js.map