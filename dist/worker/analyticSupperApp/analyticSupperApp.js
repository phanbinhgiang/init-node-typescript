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
class AnalyticSupperAppWorker {
    static getTotalDashboardData(req, res, next) {
        var _a, _b, _c;
        return __awaiter(this, void 0, void 0, function* () {
            const time = 1656954000000;
            const to = (0, moment_1.default)(time);
            const from = (0, moment_1.default)(time).subtract(14, 'day');
            const dashboardData14days = yield DashboardData_1.default.find({
                interval: 'day',
                startAt: {
                    $gt: new Date(from.valueOf()),
                    $lte: new Date(to.valueOf()),
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
            const time = 1656954000000;
            const { type, chart } = req.query;
            const to = (0, moment_1.default)(time);
            let from;
            let matchTime;
            switch (type) {
                case 'month':
                    from = (0, moment_1.default)(time).subtract(1, 'month');
                    matchTime = {
                        $gt: new Date(from.valueOf()),
                        $lte: new Date(to.valueOf()),
                    };
                    break;
                case 'all':
                    matchTime = {
                        $lte: new Date(to.valueOf()),
                    };
                    break;
                default:
                    from = (0, moment_1.default)(time).subtract(7, 'day');
                    matchTime = {
                        $gt: new Date(from.valueOf()),
                        $lte: new Date(to.valueOf()),
                    };
                    break;
            }
            let dataResponse;
            switch (chart) {
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
                        addressActive: 1,
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
            const dashboardData = yield DashboardData_1.default.find({
                interval: 'day',
                startAt: matchTime,
            }, dataResponse).sort({ startAt: 1 }).lean();
            req.response = dashboardData;
            next();
        });
    }
    static getMatchTime(type, time) {
        const to = (0, moment_1.default)(time);
        let from;
        let matchTime;
        switch (type) {
            case 'week':
                from = (0, moment_1.default)(time).subtract(7, 'day');
                matchTime = {
                    $gt: new Date(from.valueOf()),
                    $lte: new Date(to.valueOf()),
                };
                break;
            case 'month':
                from = (0, moment_1.default)(time).subtract(1, 'month');
                matchTime = {
                    $gt: new Date(from.valueOf()),
                    $lte: new Date(to.valueOf()),
                };
                break;
            case 'all':
                matchTime = {
                    $lte: new Date(to.valueOf()),
                };
                break;
            default:
                from = (0, moment_1.default)(time).subtract(1, 'day');
                matchTime = {
                    $gt: new Date(from.valueOf()),
                    $lte: new Date(to.valueOf()),
                };
                break;
        }
        return matchTime;
    }
    static getUserDashboard(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const time = 1656954000000;
            const { type } = req.query;
            const matchTime = AnalyticSupperAppWorker.getMatchTime(type, time);
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
            const matchTime = AnalyticSupperAppWorker.getMatchTime(type, time);
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
                type,
                ios: getTotalData(item.start, item.end, 'ios'),
                android: getTotalData(item.start, item.end, 'android'),
            }));
            req.response = {
                arrQueryTime: arrQueryTime.length,
                dataResponse,
            };
            next();
        });
    }
}
exports.default = AnalyticSupperAppWorker;
//# sourceMappingURL=analyticSupperApp.js.map