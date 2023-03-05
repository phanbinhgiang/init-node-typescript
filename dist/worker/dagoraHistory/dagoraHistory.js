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
/* eslint-disable max-len */
/* eslint-disable newline-per-chained-call */
/* eslint-disable no-shadow */
/* eslint-disable function-paren-newline */
/* eslint-disable no-unused-vars */
/* eslint-disable implicit-arrow-linebreak */
/* eslint-disable prefer-destructuring */
/* eslint-disable no-param-reassign */
/* eslint-disable dot-notation */
/* eslint-disable no-underscore-dangle */
const underscore_1 = __importDefault(require("underscore"));
const lodash_1 = require("lodash");
const dagoraHistory_1 = __importDefault(require("../../model/dagoraHistory/dagoraHistory"));
const campTestReport_1 = require("../campTetReport/campTestReport");
const DagoraReport_1 = __importDefault(require("../../model/dagora/DagoraReport"));
class DagoraHistoryWorker {
    static QueryTimeArray(from, to, type) {
        const stringDateStart = (0, campTestReport_1.convertDateMoment)(new Date(parseInt(from)), 'YYYY-MM-DD');
        const stringDateEnd = (0, campTestReport_1.convertDateMoment)(new Date(parseInt(to)), 'YYYY-MM-DD');
        const start = new Date(stringDateStart).getTime();
        const end = new Date(stringDateEnd).getTime();
        let arrQueryTime = [];
        const startOfWeek = (date) => {
            const diff = date.getDate() - date.getDay() + (date.getDay() === 0 ? -6 : 1);
            return new Date(date.setDate(diff));
        };
        switch (type) {
            case 'date': {
                arrQueryTime = underscore_1.default.range(start, end, 86400000).map((value) => ({ start: new Date(value), end: new Date(value + 86400000) }));
                break;
            }
            case 'week': {
                const startWeek = startOfWeek(new Date(start)).getTime();
                arrQueryTime = underscore_1.default.range(startWeek, end, 86400000 * 7).map((value) => ({ start: new Date(value), end: new Date(value + 86400000 * 7) }));
                break;
            }
            case 'month': {
                arrQueryTime = (underscore_1.default.range(start, end + 86400000 * 30, 86400000).map((value, index, self) => (0, campTestReport_1.convertDateMoment)(new Date(parseInt(value)), 'YYYY-MM-01'))).filter((value, index, self) => self.indexOf(value) === index).map((value, index, self) => ({ start: new Date(value), end: new Date(self[index + 1]) })).filter((item) => item.end.getTime());
                break;
            }
            default:
                break;
        }
        return arrQueryTime;
    }
    static getDagoraHistory(req, res, next) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            const { from, to, type } = req.query;
            const arrQueryTime = DagoraHistoryWorker.QueryTimeArray(from, to, type);
            const data = yield dagoraHistory_1.default.find({
                createdAt: { $gte: (_a = arrQueryTime[0]) === null || _a === void 0 ? void 0 : _a.start, $lte: (_b = arrQueryTime[arrQueryTime.length - 1]) === null || _b === void 0 ? void 0 : _b.end },
                type: { $in: ['buy', 'sell', 'endBid'] },
            }, 'address chain owner type price createdAt').sort({ createdAt: 1 }).lean();
            const getDataVolumeAll = (start, end) => data.filter((item) => item['createdAt'] >= start && item['createdAt'] < end).reduce((total, item) => total + item['price'], 0);
            const getDataVolumeChains = (start, end) => Object.values(data.filter((item) => item['createdAt'] >= start && item['createdAt'] < end).reduce((total, item) => {
                const chain = item['chain'];
                const price = item['price'];
                total[chain] = { chain, volume: (0, lodash_1.get)(total[chain], 'volume', 0) + price };
                return total;
            }, {}));
            const getDataTopSeller = (start, end) => Object.values(data.filter((item) => { var _a; return ((_a = item['owner']) === null || _a === void 0 ? void 0 : _a.length) && item['createdAt'] >= start && item['createdAt'] < end; }).reduce((total, item) => {
                const owner = item['owner'];
                const price = item['price'];
                total[owner] = { owner, volume: (0, lodash_1.get)(total[owner], 'volume', 0) + price };
                return total;
            }, {}));
            const getDataTopCollection = (start, end) => Object.values(data.filter((item) => item['createdAt'] >= start && item['createdAt'] < end).reduce((total, item) => {
                const address = item['address'];
                const price = item['price'];
                const chain = item['chain'];
                total[address] = { address, chain, volume: (0, lodash_1.get)(total[address], 'volume', 0) + price };
                return total;
            }, {}));
            const getTotalTxData = (start, end) => data.filter((item) => item['createdAt'] >= start && item['createdAt'] < end).length;
            const dataResponse = arrQueryTime.map((item) => ({
                dateStart: item.start,
                dateEnd: item.end,
                volumeAll: getDataVolumeAll(item.start, item.end),
                volumeChain: getDataVolumeChains(item.start, item.end),
                topSeller: getDataTopSeller(item.start, item.end),
                topCollection: getDataTopCollection(item.start, item.end),
                totalTx: getTotalTxData(item.start, item.end),
                avaPrice: getDataVolumeAll(item.start, item.end) / getTotalTxData(item.start, item.end),
            }));
            req.response = dataResponse;
            next();
        });
    }
    static postDagoraHistory(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = req.body;
            // create and update data
            data.forEach((item) => __awaiter(this, void 0, void 0, function* () {
                const dataFind = yield DagoraReport_1.default.findOne({ date: item.date }, '_id');
                if (dataFind === null) {
                    yield DagoraReport_1.default.create(item);
                }
                else {
                    yield dataFind.updateOne(item);
                }
            }));
            req.response = {
                res: data,
                total: data.length,
            };
            next();
        });
    }
}
exports.default = DagoraHistoryWorker;
//# sourceMappingURL=dagoraHistory.js.map