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
const get_1 = __importDefault(require("lodash/get"));
// import { testSolona } from 'notification';
const dagoraHistory_1 = __importDefault(require("../../model/dagora/dagoraHistory"));
const DagoraReport_1 = __importDefault(require("../../model/dagora/DagoraReport"));
const Interaction_1 = __importDefault(require("../../model/interaction/Interaction"));
const index_1 = require("../function/index");
class DagoraHistoryWorker {
    static postDagoraHistory(data) {
        return __awaiter(this, void 0, void 0, function* () {
            // create and update data
            const dataFind = yield DagoraReport_1.default.findOne({
                dateStart: data.dateStart,
                dateEnd: data.dateEnd,
                type: data.type,
            }, '_id');
            if (dataFind === null) {
                yield DagoraReport_1.default.create(data);
            }
            else {
                yield dataFind.updateOne(data);
            }
        });
    }
    static callDagoraReport(req, res, next) {
        var _a, _b, _c, _d;
        return __awaiter(this, void 0, void 0, function* () {
            const { from, to, type } = req.query;
            const arrQueryTime = (0, index_1.getQueryTimeArray)(from, to, type);
            const dataDagoraHistoryPromise = dagoraHistory_1.default.find({
                createdAt: { $gte: (_a = arrQueryTime[0]) === null || _a === void 0 ? void 0 : _a.start, $lte: (_b = arrQueryTime[arrQueryTime.length - 1]) === null || _b === void 0 ? void 0 : _b.end },
                type: { $in: ['buy', 'sell', 'endBid'] },
            }, 'from type price createdAt tokenAddress address chain owner').sort({ createdAt: 1 }).lean();
            const dataInteractionsPromise = Interaction_1.default.find({
                createdAt: { $gte: (_c = arrQueryTime[0]) === null || _c === void 0 ? void 0 : _c.start, $lte: (_d = arrQueryTime[arrQueryTime.length - 1]) === null || _d === void 0 ? void 0 : _d.end },
                type: { $in: ['nftView', 'collectionView', 'bundleView', 'launchpadView', 'userView'] },
            }, 'id type relatedID createdAt').lean();
            const [dataDagoraHistory, dataInteractions] = yield Promise.all([dataDagoraHistoryPromise, dataInteractionsPromise]);
            const getDataVolumeAddressToken = (start, end) => Object.values(dataDagoraHistory.filter((item) => item.createdAt >= start && item.createdAt < end).reduce((total, item) => {
                const { tokenAddress, price } = item;
                total[tokenAddress] = { tokenAddress, volume: (0, get_1.default)(total[tokenAddress], 'volume', 0) + price };
                return total;
            }, {}));
            const getTotalTxData = (start, end) => dataDagoraHistory.filter((item) => item.createdAt >= start && item.createdAt < end).length;
            const getDataTopBuyer = (start, end) => Object.values(dataDagoraHistory.filter((item) => {
                var _a;
                return ((_a = item.from) === null || _a === void 0 ? void 0 : _a.length)
                    && item.createdAt >= start && item.createdAt < end;
            }).reduce((total, item) => {
                const { from: fromID, price } = item;
                total[fromID] = { fromID, volume: (0, get_1.default)(total[fromID], 'volume', 0) + price };
                return total;
            }, {}));
            const getTotalViews = (start, end) => Object.values(dataInteractions.filter((item) => item.createdAt >= start && item.createdAt < end).reduce((total, item) => {
                const { type: typeView, relatedID } = item;
                total[typeView] = { typeView, views: (0, get_1.default)(total[typeView], 'views', 0) + relatedID[0] };
                return total;
            }, {}));
            const getTopViews = (start, end) => Object.values(dataInteractions.filter((item) => item.createdAt >= start && item.createdAt < end).reduce((total, item) => {
                const { id, relatedID } = item;
                total[id] = { id, views: (0, get_1.default)(total[id], 'views', 0) + relatedID[0] };
                return total;
            }, {}));
            const getDataVolumeAll = (start, end) => dataDagoraHistory.filter((item) => item.createdAt >= start && item.createdAt < end).reduce((total, item) => total + item.price, 0);
            const getDataVolumeChains = (start, end) => Object.values(dataDagoraHistory.filter((item) => item.createdAt >= start && item.createdAt < end).reduce((total, item) => {
                const { chain, price } = item;
                total[chain] = { chain, volume: (0, get_1.default)(total[chain], 'volume', 0) + price };
                return total;
            }, {}));
            const getDataTopSeller = (start, end) => Object.values(dataDagoraHistory.filter((item) => { var _a; return ((_a = item.owner) === null || _a === void 0 ? void 0 : _a.length) && item.createdAt >= start && item.createdAt < end; }).reduce((total, item) => {
                const { owner, price } = item;
                total[owner] = { owner, volume: (0, get_1.default)(total[owner], 'volume', 0) + price };
                return total;
            }, {}));
            const getDataTopCollection = (start, end) => Object.values(dataDagoraHistory.filter((item) => item.createdAt >= start && item.createdAt < end).reduce((total, item) => {
                const { address, price, chain } = item;
                total[address] = { address, chain, volume: (0, get_1.default)(total[address], 'volume', 0) + price };
                return total;
            }, {}));
            const dataResponse = arrQueryTime.map((item) => ({
                dateStart: item.start,
                dateEnd: item.end,
                type,
                volumeAddressToken: getDataVolumeAddressToken(item.start, item.end),
                totalTransaction: getTotalTxData(item.start, item.end),
                totalViews: getTotalViews(item.start, item.end),
                topViews: getTopViews(item.start, item.end).sort((a, b) => b.views - a.views).slice(0, 10),
                topBuyer: getDataTopBuyer(item.start, item.end).sort((a, b) => b.volume - a.volume).slice(0, 10),
                volumeAll: getDataVolumeAll(item.start, item.end),
                volumeChain: getDataVolumeChains(item.start, item.end),
                topSeller: getDataTopSeller(item.start, item.end).sort((a, b) => b.volume - a.volume).slice(0, 10),
                topCollection: getDataTopCollection(item.start, item.end).sort((a, b) => b.volume - a.volume).slice(0, 10),
                totalTx: getTotalTxData(item.start, item.end),
                avaPrice: (getDataVolumeAll(item.start, item.end) / getTotalTxData(item.start, item.end) || 0),
            }));
            dataResponse.forEach((item) => __awaiter(this, void 0, void 0, function* () {
                yield DagoraHistoryWorker.postDagoraHistory(item);
            }));
            req.response = dataResponse;
            next();
        });
    }
    static getDataDagoraReportField(req, res, next) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            const { from, to, type, field, } = req.query;
            const arrQueryTime = (0, index_1.getQueryTimeArray)(from, to, type);
            const dataResponse = yield DagoraReport_1.default.find({
                dateStart: { $gte: (_a = arrQueryTime[0]) === null || _a === void 0 ? void 0 : _a.start, $lte: (_b = arrQueryTime[arrQueryTime.length - 1]) === null || _b === void 0 ? void 0 : _b.end },
                type,
            }, `dateStart dateEnd type ${field.replaceAll(' ', '').replaceAll(',', ' ')}`).sort({ dateStart: 1 }).lean();
            req.response = dataResponse;
            next();
        });
    }
}
exports.default = DagoraHistoryWorker;
//# sourceMappingURL=dagoraHistory.js.map