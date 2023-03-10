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
const moment_1 = __importDefault(require("moment"));
const DashboardData_1 = __importDefault(require("../../model/dashboardData/DashboardData"));
const User_1 = __importDefault(require("../../model/user/User"));
const KYCVerify_1 = __importDefault(require("../../model/user/KYCVerify"));
const IPUser_1 = __importDefault(require("../../model/user/IPUser"));
const DeviceSource_1 = __importDefault(require("../../model/DeviceSource/DeviceSource"));
const index_1 = require("../function/index");
const AddressList_1 = __importDefault(require("../../model/addressList/AddressList"));
const dagoraHistory_1 = __importDefault(require("../../model/dagora/dagoraHistory"));
const AggregatorHistory_1 = __importDefault(require("../../model/aggregatorHistory/AggregatorHistory"));
class AnalyticSupperAppWorker {
    // DashBoard
    static getTotalDashboardData(req, res, next) {
        var _a, _b, _c;
        return __awaiter(this, void 0, void 0, function* () {
            const time = new Date().getTime();
            const to = (0, moment_1.default)(time);
            const from = (0, moment_1.default)(time).subtract(14, 'day');
            const dashboardData14days = yield DashboardData_1.default.find({
                interval: 'day',
                startAt: {
                    $gte: new Date(from.valueOf()),
                    $lt: new Date(to.valueOf()),
                },
            }, {
                _id: 0,
                userNew: 1,
                userTotal: 1,
                addressNew: 1,
                addressTotal: 1,
                swapVolume: 1,
                swapVolumeTotal: 1,
                startAt: 1,
                pointTotal: 1,
            }).sort({ startAt: -1 }).lean();
            const getData = (type) => {
                const totalData7days = dashboardData14days.slice(0, 7).reduce((total, item) => total + ((item === null || item === void 0 ? void 0 : item[type]) || 0), 0);
                const totalData7daysBefore = dashboardData14days.slice(7).reduce((total, item) => total + ((item === null || item === void 0 ? void 0 : item[type]) || 0), 0);
                return {
                    total: totalData7days,
                    percent: totalData7daysBefore ? ((totalData7days - totalData7daysBefore) / totalData7daysBefore) * 100 : 0,
                };
            };
            req.response = {
                newUser: {
                    total: getData('userNew').total,
                    percent: getData('userNew').percent,
                },
                newWallet: {
                    total: getData('addressNew').total,
                    percent: getData('addressNew').percent,
                },
                swapVolume: {
                    total: getData('swapVolume').total,
                    percent: getData('swapVolume').percent,
                },
                // revenue : ....
                Revenue: {
                    total: 0,
                    percent: 0,
                },
                totalUserSummary: ((_a = dashboardData14days[0]) === null || _a === void 0 ? void 0 : _a.userTotal) || 0,
                totalAddressSummary: ((_b = dashboardData14days[0]) === null || _b === void 0 ? void 0 : _b.addressTotal) || 0,
                XPoint: ((_c = dashboardData14days[0]) === null || _c === void 0 ? void 0 : _c.pointTotal) || 0,
            };
            next();
        });
    }
    static getChartDashboard(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const time = new Date().getTime();
            const { type, chart } = req.query;
            const { matchTime, interval } = (0, index_1.getQueryChart)(type, time);
            const dataResponse = (0, index_1.getFiledDataDashboardResponse)(chart);
            const dashboardData = yield DashboardData_1.default.find({
                interval,
                startAt: matchTime,
            }, dataResponse).sort({ startAt: 1 }).lean();
            req.response = dashboardData;
            next();
        });
    }
    // User
    static getUserDashboard(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const time = new Date().getTime();
            const { type } = req.query;
            const matchTime = (0, index_1.getMatchTime)(type, time);
            const userDataTotalPromise = User_1.default.countDocuments({
                createdAt: matchTime,
            }).lean();
            const userKCYPromise = KYCVerify_1.default.countDocuments({
                createdAt: matchTime,
                status: 'verified',
            }).lean();
            const [totalUser, kycUser] = yield Promise.all([userDataTotalPromise, userKCYPromise]);
            req.response = {
                totalUser,
                newUser: totalUser - kycUser,
                kycUser,
            };
            next();
        });
    }
    static getPopularCountries(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const time = new Date().getTime();
            const { type } = req.query;
            const matchTime = (0, index_1.getMatchTime)(type, time);
            const dataCountries = yield IPUser_1.default.aggregate([
                {
                    $match: {
                        createdAt: matchTime,
                    },
                },
                {
                    $group: {
                        _id: '$country',
                        total: { $sum: 1 },
                    },
                },
            ]);
            const dataTotalCount = dataCountries.reduce((totalCount, country) => totalCount + country.total, 0);
            const dataRes = dataCountries.map((item) => ({ country: item._id, percent: dataTotalCount ? (item.total / dataTotalCount) * 100 : 0 }));
            req.response = dataRes.sort((a, b) => a.percent - b.percent);
            next();
        });
    }
    static getDeviceDashboard(req, res, next) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            const time = new Date().getTime();
            const { type } = req.query;
            const to = (0, moment_1.default)(time);
            let from;
            let arrQueryTime;
            switch (type) {
                case 'week':
                    from = (0, moment_1.default)(time).subtract(7, 'day');
                    arrQueryTime = (0, index_1.getQueryTimeArray)(from.valueOf(), to.valueOf(), 'day').slice(1);
                    break;
                case 'month':
                    from = (0, moment_1.default)(time).subtract(1, 'month');
                    arrQueryTime = (0, index_1.getQueryTimeArray)(from.valueOf(), to.valueOf(), 'day').slice(1);
                    break;
                case 'all':
                    from = (0, moment_1.default)((yield DeviceSource_1.default.aggregate([
                        {
                            $group: {
                                _id: null,
                                minTime: { $min: '$createdAt' },
                            },
                        },
                    ]))[0].minTime);
                    arrQueryTime = (0, index_1.getQueryTimeArray)(from.valueOf(), to.valueOf(), 'month');
                    break;
                default:
                    from = (0, moment_1.default)(time).subtract(1, 'day');
                    arrQueryTime = (0, index_1.getQueryTimeArray)(from.valueOf(), to.valueOf(), 'hour').slice(1);
                    break;
            }
            const deviceSourceData = yield DeviceSource_1.default.find({
                createdAt: { $gte: (_a = arrQueryTime[0]) === null || _a === void 0 ? void 0 : _a.start, $lte: (_b = arrQueryTime[arrQueryTime.length - 1]) === null || _b === void 0 ? void 0 : _b.end },
            }, { _id: 0, os: 1, createdAt: 1 }).lean();
            const getTotalData = (start, end, os) => deviceSourceData.filter((item) => item.createdAt >= start && item.createdAt <= end && item.os === os).length;
            const dataResponse = arrQueryTime.map((item) => ({
                time: item.start,
                ios: getTotalData(item.start, item.end, 'ios'),
                android: getTotalData(item.start, item.end, 'android'),
            }));
            req.response = dataResponse;
            next();
        });
    }
    // Wallet
    static getWalletDashboard(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            // return: wallet User( total, percent), total wallet created (total, percent), total wallet, total transfer volume, total transfer transaction
            const time = new Date().getTime();
            const to = (0, moment_1.default)(time);
            const from = (0, moment_1.default)(time).subtract(14, 'day');
            const dashboardData14daysPromise = DashboardData_1.default.find({
                interval: 'day',
                startAt: {
                    $gte: new Date(from.valueOf()),
                    $lt: new Date(to.valueOf()),
                },
            }, {
                _id: 0,
                addressNew: 1,
                addressTotal: 1,
                transactionVolumeTotal: 1,
                transactionCountTotal: 1,
                startAt: 1,
            }).sort({ startAt: -1 }).lean();
            const addressData7daysPromise = AddressList_1.default.find({
                createdAt: {
                    $gte: new Date((0, moment_1.default)(time).subtract(7, 'day').valueOf()),
                    $lt: new Date(to.valueOf()),
                },
            }, { _id: 0, createdAt: 1, createdUser: 1 }).sort({ createdAt: -1 }).lean();
            const addressData7daysBeforePromise = AddressList_1.default.find({
                createdAt: {
                    $gte: new Date((0, moment_1.default)(time).subtract(14, 'day').valueOf()),
                    $lt: new Date((0, moment_1.default)(time).subtract(7, 'day').valueOf()),
                },
            }, { _id: 0, createdAt: 1, createdUser: 1 }).sort({ createdAt: -1 }).lean();
            const [dashboardData14days, addressData7days, addressData7daysBefore] = yield Promise.all([dashboardData14daysPromise, addressData7daysPromise, addressData7daysBeforePromise]);
            const totalWalletCreated7days = dashboardData14days.slice(0, 7).reduce((total, item) => total + item.addressNew, 0);
            const totalWalletCreated7daysBefore = dashboardData14days.slice(7).reduce((total, item) => total + item.addressNew, 0);
            const totalWalletUsers7days = addressData7days.map((item) => item.createdUser).flat().filter((value, index, self) => self.indexOf(value) === index);
            const totalWalletUsers7daysBefore = addressData7daysBefore.map((item) => item.createdUser).flat().filter((value, index, self) => self.indexOf(value) === index);
            req.response = {
                walletUser: {
                    total: totalWalletUsers7days.length,
                    percent: totalWalletUsers7daysBefore.length ? ((totalWalletUsers7days.length - totalWalletUsers7daysBefore.length) / totalWalletUsers7daysBefore.length) * 100 : 0,
                },
                totalWalletCreated: {
                    total: totalWalletCreated7days,
                    percent: totalWalletCreated7daysBefore ? ((totalWalletCreated7days - totalWalletCreated7daysBefore) / totalWalletCreated7daysBefore) * 100 : 0,
                },
                totalWallet: dashboardData14days.length ? dashboardData14days[0].addressTotal : 0,
                totalTransferVolume: dashboardData14days.length ? dashboardData14days[0].transactionVolumeTotal : 0,
                totalTransferTransaction: dashboardData14days.length ? dashboardData14days[0].transactionCountTotal : 0,
            };
            next();
        });
    }
    static getWalletChart(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const time = new Date().getTime();
            const { type, chart } = req.query;
            const { matchTime, interval } = (0, index_1.getQueryChart)(type, time);
            const dataResponse = (0, index_1.getFiledDataDashboardResponse)(chart);
            const dashboardData = yield DashboardData_1.default.find({
                interval,
                startAt: matchTime,
            }, dataResponse).sort({ startAt: 1 }).lean();
            req.response = dashboardData;
            next();
        });
    }
    static getWalletCreateNewAndRestore(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const time = new Date().getTime();
            const { type } = req.query;
            const matchTime = (0, index_1.getMatchTime)(type, time);
            const createNewTotalPromise = AddressList_1.default.countDocuments({ createdAt: matchTime, numCreated: { $lte: 1 } }).lean();
            const createNewMultiTotalPromise = AddressList_1.default.countDocuments({ createdAt: matchTime, numCreated: { $lte: 1 }, isMulti: false }).lean();
            const createNewSingleChainDetailPromise = AddressList_1.default.aggregate([
                {
                    $match: {
                        createdAt: matchTime,
                        numCreated: { $lte: 1 },
                        isMulti: false,
                    },
                },
                {
                    $group: {
                        _id: '$chain',
                        total: { $sum: 1 },
                    },
                },
            ]);
            const restoreTotalPromise = AddressList_1.default.countDocuments({ createdAt: matchTime, numCreated: { $gt: 1 } }).lean();
            const restoreMultiTotalPromise = AddressList_1.default.countDocuments({ createdAt: matchTime, numCreated: { $gt: 1 }, isMulti: false }).lean();
            const restoreSingleChainDetailPromise = AddressList_1.default.aggregate([
                {
                    $match: {
                        createdAt: matchTime,
                        numCreated: { $gt: 1 },
                        isMulti: false,
                    },
                },
                {
                    $group: {
                        _id: '$chain',
                        total: { $sum: 1 },
                    },
                },
            ]);
            const [createNewTotal, createNewMultiTotal, createNewSingleChainDetail, restoreTotal, restoreMultiTotal, restoreSingleChainDetail] = yield Promise.all([createNewTotalPromise, createNewMultiTotalPromise, createNewSingleChainDetailPromise, restoreTotalPromise, restoreMultiTotalPromise, restoreSingleChainDetailPromise]);
            const percentRestoreMultiChain = (restoreMultiTotal / restoreTotal) * 100;
            const percentCreateNewMultiChain = (createNewMultiTotal / createNewTotal) * 100;
            const createNewSingleChainTotal = createNewSingleChainDetail.reduce((total, value) => total + value.total, 0);
            const restoreSingleChainTotal = restoreSingleChainDetail.reduce((total, value) => total + value.total, 0);
            req.response = {
                walletCreate: createNewTotal + restoreTotal,
                createNew: {
                    total: createNewTotal,
                    singleChain: percentCreateNewMultiChain,
                    multiChain: 100 - percentCreateNewMultiChain,
                    singleChainDetail: createNewSingleChainDetail.map((item) => ({ chain: item._id, percent: createNewSingleChainTotal ? (item.total / createNewSingleChainTotal) * 100 : 0 })),
                },
                restore: {
                    total: restoreTotal,
                    singleChain: percentRestoreMultiChain,
                    multiChain: 100 - percentRestoreMultiChain,
                    singleChainDetail: restoreSingleChainDetail.map((item) => ({ chain: item._id, percent: restoreSingleChainTotal ? (item.total / restoreSingleChainTotal) * 100 : 0 })),
                },
            };
            next();
        });
    }
    static getDetailTransaction(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const time = new Date().getTime();
            const { type, limit = 10, page = 1 } = req.query;
            const { matchTime } = (0, index_1.getQueryChart)(type, time);
            const dagoraHistoryData = yield dagoraHistory_1.default.aggregate([
                {
                    $match: {
                        createdAt: matchTime,
                    },
                },
                {
                    $addFields: {
                        value: { $multiply: ['$amount', '$price'] },
                    },
                },
                {
                    $project: {
                        _id: 0,
                        from: 1,
                        chain: 1,
                        address: 1,
                        value: 1,
                        tokenAddress: 1,
                        createdAt: 1,
                    },
                },
                {
                    $sort: { createdAt: -1 },
                },
                {
                    $sort: { value: -1 },
                },
                {
                    $skip: parseInt(limit) * (parseInt(page) - 1),
                },
                {
                    $limit: parseInt(limit),
                },
            ]);
            req.response = dagoraHistoryData;
            next();
        });
    }
    // Swap dashboard
    static getSwapDashboard(req, res, next) {
        var _a, _b, _c, _d;
        return __awaiter(this, void 0, void 0, function* () {
            const time = new Date().getTime();
            const to = (0, moment_1.default)(time);
            const from = (0, moment_1.default)(time).subtract(14, 'day');
            const { chain = 'all' } = req.query;
            const dashboardData14days = yield DashboardData_1.default.find({
                interval: 'day',
                startAt: {
                    $gte: new Date(from.valueOf()),
                    $lt: new Date(to.valueOf()),
                },
            }, {
                _id: 0,
                swapVolume: 1,
                swapVolumeTotal: 1,
                swapCount: 1,
                swapCountTotal: 1,
                swapVolumeSummary: 1,
                swapCountSummary: 1,
                startAt: 1,
            }).sort({ startAt: -1 }).lean();
            const getDataAllChain = (type) => {
                const totalData7days = dashboardData14days.slice(0, 7).reduce((total, item) => total + ((item === null || item === void 0 ? void 0 : item[type]) || 0), 0);
                const totalData7daysBefore = dashboardData14days.slice(7).reduce((total, item) => total + ((item === null || item === void 0 ? void 0 : item[type]) || 0), 0);
                return {
                    total: totalData7days,
                    percent: totalData7daysBefore ? ((totalData7days - totalData7daysBefore) / totalData7daysBefore) * 100 : 0,
                };
            };
            const getDataSingleChain = (type) => {
                const totalData7days = dashboardData14days.slice(0, 7).filter((item) => item === null || item === void 0 ? void 0 : item[type]).map((item) => item[type]).flat();
                const data7daysChain = totalData7days.filter((item) => item.chain === chain).reduce((total, it) => total + (it.value || 0), 0);
                const totalData7daysBefore = dashboardData14days.slice(7).filter((item) => item === null || item === void 0 ? void 0 : item[type]).map((item) => item[type]).flat();
                const data7daysChainBefore = totalData7daysBefore.filter((item) => item.chain === chain).reduce((total, it) => total + (it.value || 0), 0);
                const percent = data7daysChainBefore ? ((data7daysChain - data7daysChainBefore) / data7daysChainBefore) * 100 : 0;
                return { total: data7daysChain, percent };
            };
            if (chain === 'all') {
                const swapUserData7daysPromise = AggregatorHistory_1.default.aggregate([
                    {
                        $match: {
                            createdAt: {
                                $gte: new Date((0, moment_1.default)(time).subtract(7, 'day').valueOf()),
                                $lt: new Date((0, moment_1.default)(time).valueOf()),
                            },
                        },
                    },
                    {
                        $group: {
                            _id: '$createdUser',
                        },
                    },
                ]);
                const swapUserData7daysBeforePromise = AggregatorHistory_1.default.aggregate([
                    {
                        $match: {
                            createdAt: {
                                $gte: new Date((0, moment_1.default)(time).subtract(14, 'day').valueOf()),
                                $lt: new Date((0, moment_1.default)(time).subtract(7, 'day').valueOf()),
                            },
                        },
                    },
                    {
                        $group: {
                            _id: '$createdUser',
                        },
                    },
                ]);
                const swapAddressData7daysPromise = AggregatorHistory_1.default.aggregate([
                    {
                        $match: {
                            createdAt: {
                                $gte: new Date((0, moment_1.default)(time).subtract(7, 'day').valueOf()),
                                $lt: new Date((0, moment_1.default)(time).valueOf()),
                            },
                        },
                    },
                    {
                        $group: {
                            _id: '$from',
                        },
                    },
                ]);
                const swapAddressData7daysBeforePromise = AggregatorHistory_1.default.aggregate([
                    {
                        $match: {
                            createdAt: {
                                $gte: new Date((0, moment_1.default)(time).subtract(14, 'day').valueOf()),
                                $lt: new Date((0, moment_1.default)(time).subtract(7, 'day').valueOf()),
                            },
                        },
                    },
                    {
                        $group: {
                            _id: '$from',
                        },
                    },
                ]);
                const [swapUserData7days, swapUserData7daysBefore, swapAddressData7days, swapAddressData7daysBefore] = yield Promise.all([swapUserData7daysPromise, swapUserData7daysBeforePromise, swapAddressData7daysPromise, swapAddressData7daysBeforePromise]);
                req.response = {
                    swapUser: {
                        total: swapUserData7days.length,
                        percent: (swapUserData7daysBefore.length) ? ((swapUserData7days.length - swapUserData7daysBefore.length) / swapUserData7daysBefore.length) * 100 : 0,
                    },
                    totalSwapAddress: {
                        total: swapAddressData7days.length,
                        percent: (swapAddressData7daysBefore.length) ? ((swapAddressData7days.length - swapAddressData7daysBefore.length) / swapAddressData7daysBefore.length) * 100 : 0,
                    },
                    totalSwapVolume: {
                        total: getDataAllChain('swapVolume').total,
                        percent: getDataAllChain('swapVolume').percent,
                    },
                    totalTransaction: {
                        total: getDataAllChain('swapCount').total,
                        percent: getDataAllChain('swapCount').percent,
                    },
                    // Waiting doe data
                    swapRevenue: {
                        total: 0,
                        percent: 0,
                    },
                    swapVolume: ((_a = dashboardData14days[0]) === null || _a === void 0 ? void 0 : _a.swapVolumeTotal) || 0,
                    swapTransaction: ((_b = dashboardData14days[0]) === null || _b === void 0 ? void 0 : _b.swapCountTotal) || 0,
                };
            }
            else {
                const swapUserData7daysPromise = AggregatorHistory_1.default.aggregate([
                    {
                        $match: {
                            createdAt: {
                                $gte: new Date((0, moment_1.default)(time).subtract(7, 'day').valueOf()),
                                $lt: new Date((0, moment_1.default)(time).valueOf()),
                            },
                            chain,
                        },
                    },
                    {
                        $group: {
                            _id: '$createdUser',
                        },
                    },
                ]);
                const swapUserData7daysBeforePromise = AggregatorHistory_1.default.aggregate([
                    {
                        $match: {
                            createdAt: {
                                $gte: new Date((0, moment_1.default)(time).subtract(14, 'day').valueOf()),
                                $lt: new Date((0, moment_1.default)(time).subtract(7, 'day').valueOf()),
                            },
                            chain,
                        },
                    },
                    {
                        $group: {
                            _id: '$createdUser',
                        },
                    },
                ]);
                const swapAddressData7daysPromise = AggregatorHistory_1.default.aggregate([
                    {
                        $match: {
                            createdAt: {
                                $gte: new Date((0, moment_1.default)(time).subtract(7, 'day').valueOf()),
                                $lt: new Date((0, moment_1.default)(time).valueOf()),
                            },
                            chain,
                        },
                    },
                    {
                        $group: {
                            _id: '$from',
                        },
                    },
                ]);
                const swapAddressData7daysBeforePromise = AggregatorHistory_1.default.aggregate([
                    {
                        $match: {
                            createdAt: {
                                $gte: new Date((0, moment_1.default)(time).subtract(14, 'day').valueOf()),
                                $lt: new Date((0, moment_1.default)(time).subtract(7, 'day').valueOf()),
                            },
                            chain,
                        },
                    },
                    {
                        $group: {
                            _id: '$from',
                        },
                    },
                ]);
                const [swapUserData7days, swapUserData7daysBefore, swapAddressData7days, swapAddressData7daysBefore] = yield Promise.all([swapUserData7daysPromise, swapUserData7daysBeforePromise, swapAddressData7daysPromise, swapAddressData7daysBeforePromise]);
                req.response = {
                    swapUser: {
                        total: swapUserData7days.length,
                        percent: (swapUserData7daysBefore.length) ? ((swapUserData7days.length - swapUserData7daysBefore.length) / swapUserData7daysBefore.length) * 100 : 0,
                    },
                    totalSwapAddress: {
                        total: swapAddressData7days.length,
                        percent: (swapAddressData7daysBefore.length) ? ((swapAddressData7days.length - swapAddressData7daysBefore.length) / swapAddressData7daysBefore.length) * 100 : 0,
                    },
                    totalSwapVolume: {
                        total: getDataSingleChain('swapVolumeSummary').total,
                        percent: getDataSingleChain('swapVolumeSummary').percent,
                    },
                    totalTransaction: {
                        total: getDataSingleChain('swapCountSummary').total,
                        percent: getDataSingleChain('swapCountSummary').percent,
                    },
                    // Waiting doe data
                    swapRevenue: {
                        total: 0,
                        percent: 0,
                    },
                    // default total chain
                    swapVolume: ((_c = dashboardData14days[0]) === null || _c === void 0 ? void 0 : _c.swapVolumeTotal) || 0,
                    swapTransaction: ((_d = dashboardData14days[0]) === null || _d === void 0 ? void 0 : _d.swapCountTotal) || 0,
                };
            }
            next();
        });
    }
    static getSwapChart(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const time = new Date().getTime();
            const { type, chart } = req.query;
            const { matchTime, interval } = (0, index_1.getQueryChart)(type, time);
            const dataResponse = (0, index_1.getFiledDataDashboardResponse)(chart);
            const dashboardData = yield DashboardData_1.default.find({
                interval,
                startAt: matchTime,
            }, dataResponse).sort({ startAt: 1 }).lean();
            req.response = dashboardData;
            next();
        });
    }
    static getTopTokenSwap(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const time = new Date().getTime();
            const { type, chain = 'all' } = req.query;
            const matchTime = (0, index_1.getMatchTime)(type, time);
            let match;
            if (chain === 'all') {
                match = {
                    createdAt: matchTime,
                };
            }
            else {
                match = {
                    createdAt: matchTime,
                    chain,
                };
            }
            const aggregatorHistoryDataToken0 = yield AggregatorHistory_1.default.aggregate([
                {
                    $match: match,
                },
                {
                    $group: {
                        _id: {
                            symbol: '$token0.symbol',
                        },
                        volume: { $sum: '$volume' },
                    },
                },
            ]);
            const aggregatorHistoryDataToken1 = yield AggregatorHistory_1.default.aggregate([
                {
                    $match: match,
                },
                {
                    $group: {
                        _id: {
                            symbol: '$token1.symbol',
                        },
                        volume: { $sum: '$volume' },
                    },
                },
            ]);
            const symbolToken0 = aggregatorHistoryDataToken0.map((item) => item._id.symbol);
            const symbolToken1 = aggregatorHistoryDataToken0.map((item) => item._id.symbol);
            const symbolTokens = [...symbolToken0, ...symbolToken1].filter((value, index, self) => self.indexOf(value) === index);
            const aggregatorHistoryData = symbolTokens.map((item) => {
                const dataToken0 = aggregatorHistoryDataToken0.find((it) => it._id.symbol === item);
                const dataToken1 = aggregatorHistoryDataToken1.find((it) => it._id.symbol === item);
                return { symbol: item, volume: ((dataToken0 === null || dataToken0 === void 0 ? void 0 : dataToken0.volume) || 0) + ((dataToken1 === null || dataToken1 === void 0 ? void 0 : dataToken1.volume) || 0) };
            }).sort((a, b) => b.volume - a.volume).slice(0, 5);
            req.response = aggregatorHistoryData;
            next();
        });
    }
    // update dashboardData
    static updateDashboardData(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { from, to } = req.query;
            const arrayTimeDay = (0, index_1.getQueryTimeArray)(from, to, 'day');
            const arrayTimeWeek = (0, index_1.getQueryTimeArray)(from, to, 'week');
            const arrayTimeMonth = (0, index_1.getQueryTimeArray)(from, to, 'month');
            const createAndUpdateDashboardData = (arrayTime, interval) => __awaiter(this, void 0, void 0, function* () {
                yield Promise.all(arrayTime.map((time) => __awaiter(this, void 0, void 0, function* () {
                    const swapUser = (yield AggregatorHistory_1.default.aggregate([
                        {
                            $match: {
                                createdAt: {
                                    $gte: time.start,
                                    $lte: time.end,
                                },
                            },
                        },
                        {
                            $group: {
                                _id: '$createdUser',
                            },
                        },
                    ])).length;
                    const swapAddress = (yield AggregatorHistory_1.default.aggregate([
                        {
                            $match: {
                                createdAt: {
                                    $gte: time.start,
                                    $lte: time.end,
                                },
                            },
                        },
                        {
                            $group: {
                                _id: '$from',
                            },
                        },
                    ])).length;
                    const listChain = yield AggregatorHistory_1.default.aggregate([
                        {
                            $match: {
                                createdAt: {
                                    $gte: time.start,
                                    $lte: time.end,
                                },
                            },
                        },
                        {
                            $group: {
                                _id: '$chain',
                            },
                        },
                    ]);
                    const dataSummary = yield Promise.all(listChain.map((chain) => __awaiter(this, void 0, void 0, function* () {
                        const dataUserChain = yield AggregatorHistory_1.default.aggregate([
                            {
                                $match: {
                                    createdAt: {
                                        $gte: time.start,
                                        $lte: time.end,
                                    },
                                    chain: chain._id,
                                },
                            },
                            {
                                $group: {
                                    _id: '$createdUser',
                                },
                            },
                        ]);
                        const dataAddressChain = yield AggregatorHistory_1.default.aggregate([
                            {
                                $match: {
                                    createdAt: {
                                        $gte: time.start,
                                        $lte: time.end,
                                    },
                                    chain: chain._id,
                                },
                            },
                            {
                                $group: {
                                    _id: '$from',
                                },
                            },
                        ]);
                        return { swapUser: { chain: chain._id, value: dataUserChain.length }, swapAddress: { chain: chain._id, value: dataAddressChain.length } };
                    })));
                    const swapUserSummary = dataSummary.map((item) => item.swapUser);
                    const swapAddressSummary = dataSummary.map((item) => item.swapAddress);
                    const findDataDashBoard = yield DashboardData_1.default.findOne({ id: `${interval}_${time.start.getTime()}_${time.end.getTime()}` });
                    if (!findDataDashBoard) {
                        yield DashboardData_1.default.create({
                            id: `${interval}_${time.start.getTime()}_${time.end.getTime()}`,
                            interval,
                            swapUser,
                            swapAddress,
                            swapUserSummary,
                            swapAddressSummary,
                            startAt: time.start,
                            endAt: time.end,
                        });
                    }
                    else {
                        yield findDataDashBoard.updateOne({
                            swapUser,
                            swapAddress,
                            swapUserSummary,
                            swapAddressSummary,
                        });
                    }
                })));
            });
            createAndUpdateDashboardData(arrayTimeDay, 'day');
            createAndUpdateDashboardData(arrayTimeWeek, 'week');
            createAndUpdateDashboardData(arrayTimeMonth, 'month');
            req.response = true;
            next();
        });
    }
}
exports.default = AnalyticSupperAppWorker;
//# sourceMappingURL=analyticSupperApp.js.map