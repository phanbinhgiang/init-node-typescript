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
exports.CHAIN_ARRAY = exports.TIME_CHARTS = void 0;
const moment_1 = __importDefault(require("moment"));
const DashboardData_1 = __importDefault(require("../../model/dashboardData/DashboardData"));
const User_1 = __importDefault(require("../../model/user/User"));
const KYCVerify_1 = __importDefault(require("../../model/user/KYCVerify"));
const IPUser_1 = __importDefault(require("../../model/user/IPUser"));
const CacheData_1 = __importDefault(require("../../model/system/CacheData"));
const DeviceSource_1 = __importDefault(require("../../model/DeviceSource/DeviceSource"));
const index_1 = require("../function/index");
const AddressList_1 = __importDefault(require("../../model/addressList/AddressList"));
const dagoraHistory_1 = __importDefault(require("../../model/dagora/dagoraHistory"));
const AggregatorHistory_1 = __importDefault(require("../../model/aggregatorHistory/AggregatorHistory"));
const function_1 = require("../function");
exports.TIME_CHARTS = ['day', 'week', 'month', 'all'];
exports.CHAIN_ARRAY = [
    'all',
    'binanceSmart',
    'ether',
    'solana',
    'kucoin',
    'matic',
    'heco',
    'avax',
    'boba',
    'fantom',
];
class AnalyticSupperAppWorker {
    // DashBoard
    static getTotalDashboardData(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield AnalyticSupperAppWorker.getRecordCacheData('dashboard-data');
            req.response = data;
            next();
        });
    }
    static cacheTotalDashboardData(req, res, next) {
        var _a, _b, _c;
        return __awaiter(this, void 0, void 0, function* () {
            const time = new Date('2022-07-23 17:00:00.000Z').getTime();
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
            const data = {
                newUser: {
                    total: (0, function_1.getDataDashBoard)('userNew', dashboardData14days).total,
                    percent: (0, function_1.getDataDashBoard)('userNew', dashboardData14days).percent,
                },
                newWallet: {
                    total: (0, function_1.getDataDashBoard)('addressNew', dashboardData14days).total,
                    percent: (0, function_1.getDataDashBoard)('addressNew', dashboardData14days).percent,
                },
                swapVolume: {
                    total: (0, function_1.getDataDashBoard)('swapVolume', dashboardData14days).total,
                    percent: (0, function_1.getDataDashBoard)('swapVolume', dashboardData14days).percent,
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
            const cacheDataDashBoard = yield CacheData_1.default.findOne({ id: 'dashboard-data' });
            if (!cacheDataDashBoard) {
                yield CacheData_1.default.create({
                    id: 'dashboard-data',
                    time: new Date().getTime(),
                    object: data,
                });
            }
            else {
                yield cacheDataDashBoard.updateOne({
                    time: new Date().getTime(),
                    object: data,
                });
            }
            req.response = true;
            next();
        });
    }
    static getChartDashboard(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const time = new Date('2022-07-23 17:00:00.000Z').getTime();
            const { type = 'all', chart } = req.query;
            const { matchTime, interval } = (0, index_1.getQueryChart)(type, time);
            let dataResponse;
            switch (chart) {
                // chart dashboard
                case 'user':
                    dataResponse = {
                        _id: 0,
                        userTotal: 1,
                        userActive: 1,
                        userNew: 1,
                        startAt: 1,
                    };
                    break;
                case 'address':
                    dataResponse = {
                        _id: 0,
                        addressTotal: 1,
                        // addressActive: 1, //????
                        addressNew: 1,
                        startAt: 1,
                    };
                    break;
                case 'xpoint':
                    dataResponse = {
                        _id: 0,
                        pointNew: 1,
                        pointTotal: 1,
                        startAt: 1,
                    };
                    break;
                default:
                    break;
            }
            if (!dataResponse) {
                req.response = { errMess: `notFondChart:${chart}` };
                return next();
            }
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
            const { type = 'all' } = req.query;
            const data = yield AnalyticSupperAppWorker.getRecordCacheData(`total-user-data-${type}`);
            req.response = data;
            next();
        });
    }
    static cacheUserDashboard(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            yield Promise.all(exports.TIME_CHARTS.map((type) => __awaiter(this, void 0, void 0, function* () {
                const time = new Date().getTime();
                const { matchTime } = (0, index_1.getQueryChart)(type, time);
                const userDataTotalPromise = User_1.default.countDocuments({
                    createdAt: matchTime,
                }).lean();
                const userKCYPromise = KYCVerify_1.default.countDocuments({
                    createdAt: matchTime,
                    status: 'verified',
                }).lean();
                const [totalUser, kycUser] = yield Promise.all([userDataTotalPromise, userKCYPromise]);
                const data = {
                    totalUser,
                    newUser: totalUser - kycUser,
                    kycUser,
                };
                const cacheDataDashBoard = yield CacheData_1.default.findOne({ id: `total-user-data-${type}` });
                if (!cacheDataDashBoard) {
                    yield CacheData_1.default.create({
                        id: `total-user-data-${type}`,
                        time: new Date().getTime(),
                        object: data,
                    });
                }
                else {
                    yield cacheDataDashBoard.updateOne({
                        time: new Date().getTime(),
                        data,
                    });
                }
            })));
            req.response = true;
            next();
        });
    }
    static getDeviceDashboard(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { type = 'all' } = req.query;
            const data = yield AnalyticSupperAppWorker.getRecordCacheData(`devices-data-${type}`);
            req.response = data;
            next();
        });
    }
    static cacheDeviceDashboard(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            yield Promise.all(exports.TIME_CHARTS.map((type) => __awaiter(this, void 0, void 0, function* () {
                var _a, _b;
                const time = new Date().getTime();
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
                const data = arrQueryTime.map((item) => ({
                    time: item.start,
                    ios: getTotalData(item.start, item.end, 'ios'),
                    android: getTotalData(item.start, item.end, 'android'),
                }));
                const cacheDataDashBoard = yield CacheData_1.default.findOne({ id: `devices-data-${type}` });
                if (!cacheDataDashBoard) {
                    yield CacheData_1.default.create({
                        id: `devices-data-${type}`,
                        time: new Date().getTime(),
                        object: data,
                    });
                }
                else {
                    yield cacheDataDashBoard.updateOne({
                        time: new Date().getTime(),
                        object: data,
                    });
                }
            })));
            req.response = true;
            next();
        });
    }
    static getPopularCountries(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { type = 'all' } = req.query;
            const data = yield AnalyticSupperAppWorker.getRecordCacheData(`popular-countries-data-${type}`);
            req.response = data;
            next();
        });
    }
    static cachePopularCountries(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            yield Promise.all(exports.TIME_CHARTS.map((type) => __awaiter(this, void 0, void 0, function* () {
                const time = new Date().getTime();
                const { matchTime } = (0, index_1.getQueryChart)(type, time);
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
                    {
                        $sort: {
                            total: -1,
                        },
                    },
                ]);
                const dataTotalCount = dataCountries.reduce((totalCount, country) => totalCount + country.total, 0);
                const data = dataCountries.map((item) => ({ country: item._id, percent: dataTotalCount ? (item.total / dataTotalCount) * 100 : 0 }));
                const cacheDataDashBoard = yield CacheData_1.default.findOne({ id: `popular-countries-data-${type}` });
                if (!cacheDataDashBoard) {
                    yield CacheData_1.default.create({
                        id: `popular-countries-data-${type}`,
                        time: new Date().getTime(),
                        object: data,
                    });
                }
                else {
                    yield cacheDataDashBoard.updateOne({
                        time: new Date().getTime(),
                        object: data,
                    });
                }
            })));
            req.response = true;
            next();
        });
    }
    // Wallet
    static getWalletDashboard(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield AnalyticSupperAppWorker.getRecordCacheData('wallet-data');
            req.response = data;
            next();
        });
    }
    static cacheWalletDashboard(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            // return: wallet User( total, percent), total wallet created (total, percent), total wallet, total transfer volume, total transfer transaction
            const time = new Date('2022-07-23 17:00:00.000Z').getTime();
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
            const data = {
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
            const cacheDataDashBoard = yield CacheData_1.default.findOne({ id: 'wallet-data' });
            if (!cacheDataDashBoard) {
                yield CacheData_1.default.create({
                    id: 'wallet-data',
                    time: new Date().getTime(),
                    object: data,
                });
            }
            else {
                yield cacheDataDashBoard.updateOne({
                    time: new Date().getTime(),
                    object: data,
                });
            }
            req.response = true;
            next();
        });
    }
    static getWalletChart(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const time = new Date().getTime();
            const { type, chart } = req.query;
            const { matchTime, interval } = (0, index_1.getQueryChart)(type, time);
            let dataResponse;
            switch (chart) {
                // chart wallet
                case 'newWallet':
                    dataResponse = {
                        _id: 0,
                        addressNew: 1,
                        startAt: 1,
                    };
                    break;
                case 'transferVolume':
                    dataResponse = {
                        _id: 0,
                        transactionVolume: 1,
                        transactionVolumeTotal: 1,
                        transactionVolumeSummary: 1,
                        startAt: 1,
                    };
                    break;
                case 'transferTransaction':
                    dataResponse = {
                        _id: 0,
                        transactionCount: 1,
                        transactionCountTotal: 1,
                        transactionCountSummary: 1,
                        startAt: 1,
                    };
                    break;
                default:
                    break;
            }
            if (!dataResponse) {
                req.response = { errMess: `notFondChart:${chart}` };
                return next();
            }
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
            const { type = 'all' } = req.query;
            const data = yield AnalyticSupperAppWorker.getRecordCacheData(`wallet-create-restore-data-${type}`);
            req.response = data;
            next();
        });
    }
    static cacheWalletCreateNewAndRestore(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            yield Promise.all(exports.TIME_CHARTS.map((type) => __awaiter(this, void 0, void 0, function* () {
                const time = new Date().getTime();
                const { matchTime } = (0, index_1.getQueryChart)(type, time);
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
                const data = {
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
                const cacheDataDashBoard = yield CacheData_1.default.findOne({ id: `wallet-create-restore-data-${type}` });
                if (!cacheDataDashBoard) {
                    yield CacheData_1.default.create({
                        id: `wallet-create-restore-data-${type}`,
                        time: new Date().getTime(),
                        object: data,
                    });
                }
                else {
                    yield cacheDataDashBoard.updateOne({
                        time: new Date().getTime(),
                        object: data,
                    });
                }
            })));
            req.response = true;
            next();
        });
    }
    static getDetailTransaction(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const time = new Date('2023-01-11 18:52:28.541Z').getTime();
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
        return __awaiter(this, void 0, void 0, function* () {
            const { chain = 'all' } = req.query;
            const data = yield AnalyticSupperAppWorker.getRecordCacheData(`total-swap-data-${chain}`);
            req.response = data;
            next();
        });
    }
    static cacheSwapDashboard(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            yield Promise.all(exports.CHAIN_ARRAY.map((chain) => __awaiter(this, void 0, void 0, function* () {
                var _a, _b;
                const time = new Date('2022-07-23 17:00:00.000Z').getTime();
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
                    swapVolume: 1,
                    swapVolumeTotal: 1,
                    swapCount: 1,
                    swapCountTotal: 1,
                    swapVolumeSummary: 1,
                    swapCountSummary: 1,
                    startAt: 1,
                }).sort({ startAt: -1 }).lean();
                let matchQuery;
                if (chain === 'all') {
                    matchQuery = {
                        data7days: {
                            createdAt: {
                                $gte: new Date((0, moment_1.default)(time).subtract(14, 'day').valueOf()),
                                $lt: new Date((0, moment_1.default)(time).subtract(7, 'day').valueOf()),
                            },
                        },
                        data7daysBefore: {
                            createdAt: {
                                $gte: new Date((0, moment_1.default)(time).subtract(14, 'day').valueOf()),
                                $lt: new Date((0, moment_1.default)(time).subtract(7, 'day').valueOf()),
                            },
                        },
                    };
                }
                else {
                    matchQuery = {
                        data7days: {
                            createdAt: {
                                $gte: new Date((0, moment_1.default)(time).subtract(14, 'day').valueOf()),
                                $lt: new Date((0, moment_1.default)(time).subtract(7, 'day').valueOf()),
                            },
                            chain,
                        },
                        data7daysBefore: {
                            createdAt: {
                                $gte: new Date((0, moment_1.default)(time).subtract(14, 'day').valueOf()),
                                $lt: new Date((0, moment_1.default)(time).subtract(7, 'day').valueOf()),
                            },
                            chain,
                        },
                    };
                }
                const swapUserData7daysPromise = AggregatorHistory_1.default.aggregate([
                    {
                        $match: matchQuery.data7days,
                    },
                    {
                        $group: {
                            _id: '$createdUser',
                        },
                    },
                ]);
                const swapUserData7daysBeforePromise = AggregatorHistory_1.default.aggregate([
                    {
                        $match: matchQuery.data7daysBefore,
                    },
                    {
                        $group: {
                            _id: '$createdUser',
                        },
                    },
                ]);
                const swapAddressData7daysPromise = AggregatorHistory_1.default.aggregate([
                    {
                        $match: matchQuery.data7days,
                    },
                    {
                        $group: {
                            _id: '$from',
                        },
                    },
                ]);
                const swapAddressData7daysBeforePromise = AggregatorHistory_1.default.aggregate([
                    {
                        $match: matchQuery.data7daysBefore,
                    },
                    {
                        $group: {
                            _id: '$from',
                        },
                    },
                ]);
                const [swapUserData7days, swapUserData7daysBefore, swapAddressData7days, swapAddressData7daysBefore] = yield Promise.all([swapUserData7daysPromise, swapUserData7daysBeforePromise, swapAddressData7daysPromise, swapAddressData7daysBeforePromise]);
                const data = {
                    swapUser: {
                        total: swapUserData7days.length,
                        percent: (swapUserData7daysBefore.length) ? ((swapUserData7days.length - swapUserData7daysBefore.length) / swapUserData7daysBefore.length) * 100 : 0,
                    },
                    totalSwapAddress: {
                        total: swapAddressData7days.length,
                        percent: (swapAddressData7daysBefore.length) ? ((swapAddressData7days.length - swapAddressData7daysBefore.length) / swapAddressData7daysBefore.length) * 100 : 0,
                    },
                    totalSwapVolume: {
                        total: chain === 'all' ? (0, function_1.getDataDashBoard)('swapVolume', dashboardData14days).total : (0, index_1.getDataSingleChain)('swapVolumeSummary', dashboardData14days, chain).total,
                        percent: chain === 'all' ? (0, function_1.getDataDashBoard)('swapVolume', dashboardData14days).percent : (0, index_1.getDataSingleChain)('swapVolumeSummary', dashboardData14days, chain).percent,
                    },
                    totalTransaction: {
                        total: chain === 'all' ? (0, function_1.getDataDashBoard)('swapCount', dashboardData14days).total : (0, index_1.getDataSingleChain)('swapCountSummary', dashboardData14days, chain).total,
                        percent: chain === 'all' ? (0, function_1.getDataDashBoard)('swapCount', dashboardData14days).percent : (0, index_1.getDataSingleChain)('swapCountSummary', dashboardData14days, chain).percent,
                    },
                    // Waiting data
                    swapRevenue: {
                        total: 0,
                        percent: 0,
                    },
                    // default volume total chain
                    swapVolume: ((_a = dashboardData14days[0]) === null || _a === void 0 ? void 0 : _a.swapVolumeTotal) || 0,
                    swapTransaction: ((_b = dashboardData14days[0]) === null || _b === void 0 ? void 0 : _b.swapCountTotal) || 0,
                };
                const cacheDataDashBoard = yield CacheData_1.default.findOne({ id: `total-swap-data-${chain}` });
                if (!cacheDataDashBoard) {
                    yield CacheData_1.default.create({
                        id: `total-swap-data-${chain}`,
                        time: new Date().getTime(),
                        object: data,
                    });
                }
                else {
                    yield cacheDataDashBoard.updateOne({
                        time: new Date().getTime(),
                        object: data,
                    });
                }
            })));
            req.response = true;
            next();
        });
    }
    static getSwapChart(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const time = new Date().getTime();
            const { type = 'all', chart } = req.query;
            const { matchTime, interval } = (0, index_1.getQueryChart)(type, time);
            let dataResponse;
            switch (chart) {
                //  chart swap
                case 'swapVolume':
                    dataResponse = {
                        _id: 0,
                        swapVolume: 1,
                        swapVolumeTotal: 1,
                        swapVolumeSummary: 1,
                        startAt: 1,
                    };
                    break;
                case 'swapTransaction':
                    dataResponse = {
                        _id: 0,
                        swapCount: 1,
                        swapCountTotal: 1,
                        swapCountSummary: 1,
                        startAt: 1,
                    };
                    break;
                default:
                    break;
            }
            if (!dataResponse) {
                req.response = { errMess: `notFondChart:${chart}` };
                return next();
            }
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
            const { type = 'all', chain = 'all' } = req.query;
            const data = yield AnalyticSupperAppWorker.getRecordCacheData(`top-token-swap-data-${chain}-${type}`);
            req.response = data;
            next();
        });
    }
    static cacheTopTokenSwap(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            yield Promise.all(exports.TIME_CHARTS.map((type) => __awaiter(this, void 0, void 0, function* () {
                yield Promise.all(exports.CHAIN_ARRAY.map((chain) => __awaiter(this, void 0, void 0, function* () {
                    const time = new Date().getTime();
                    const { matchTime } = (0, index_1.getQueryChart)(type, time);
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
                    const data = symbolTokens.map((item) => {
                        const dataToken0 = aggregatorHistoryDataToken0.find((it) => it._id.symbol === item);
                        const dataToken1 = aggregatorHistoryDataToken1.find((it) => it._id.symbol === item);
                        return { symbol: item, volume: ((dataToken0 === null || dataToken0 === void 0 ? void 0 : dataToken0.volume) || 0) + ((dataToken1 === null || dataToken1 === void 0 ? void 0 : dataToken1.volume) || 0) };
                    }).sort((a, b) => b.volume - a.volume).slice(0, 5);
                    const cacheDataDashBoard = yield CacheData_1.default.findOne({ id: `top-token-swap-data-${chain}-${type}` });
                    if (!cacheDataDashBoard) {
                        yield CacheData_1.default.create({
                            id: `top-token-swap-data-${chain}-${type}`,
                            time: new Date().getTime(),
                            object: data,
                        });
                    }
                    else {
                        yield cacheDataDashBoard.updateOne({
                            time: new Date().getTime(),
                            object: data,
                        });
                    }
                })));
            })));
            req.response = true;
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
    // get records cache data
    static getRecordCacheData(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const recordDashboardData = yield CacheData_1.default.findOne({ id }, { _id: 0, object: 1 }).lean();
            if (!recordDashboardData) {
                return { errMess: `documentNotFoundWithId:${id}` };
            }
            return recordDashboardData.object;
        });
    }
}
exports.default = AnalyticSupperAppWorker;
//# sourceMappingURL=analyticSupperApp.js.map