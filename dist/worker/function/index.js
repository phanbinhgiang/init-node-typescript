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
exports.fetchCacheRedis = exports.fetchCacheRedisLocal = exports.updateCacheRedislocal = exports.getFiledDataDashboardResponse = exports.getQueryChart = exports.getMatchTime = exports.getQueryTimeArray = exports.saveStorage = exports.getStorage = exports.deleteStore = exports.onlyUnique = exports.createSlug = exports.genSkipNum = exports.getLength = exports.genUpdate = void 0;
/* eslint-disable max-len */
/* eslint-disable consistent-return */
/* eslint-disable default-param-last */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable arrow-body-style */
/* eslint-disable array-callback-return */
/* eslint-disable import/prefer-default-export */
const slug_1 = __importDefault(require("slug"));
const redis_1 = require("redis");
const moment_1 = __importDefault(require("moment"));
const get_1 = __importDefault(require("lodash/get"));
const function_1 = require("../../common/function");
const genUpdate = (data, arrValue) => {
    const genObject = {};
    arrValue.map((itm) => {
        if (data[itm] !== undefined && data[itm] !== null) {
            genObject[itm] = data[itm];
        }
    });
    return Object.keys(genObject)[0] ? genObject : false;
};
exports.genUpdate = genUpdate;
const getLength = (value) => {
    return value ? value.length : 0;
};
exports.getLength = getLength;
const genSkipNum = (page, size) => {
    return (parseInt(page) - 1) * parseInt(size);
};
exports.genSkipNum = genSkipNum;
const createSlug = (text) => {
    return (0, slug_1.default)(text);
};
exports.createSlug = createSlug;
const onlyUnique = (value, index, self) => {
    return self.indexOf(value) === index;
};
exports.onlyUnique = onlyUnique;
const clientRedis = (0, redis_1.createClient)();
const connectRedis = () => __awaiter(void 0, void 0, void 0, function* () {
    yield clientRedis.connect();
});
connectRedis();
const deleteStore = (key) => {
    clientRedis.del(key);
};
exports.deleteStore = deleteStore;
const getStorage = (key) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield clientRedis.get(key);
        return data ? JSON.parse(data) : null;
    }
    catch (error) {
        return null;
    }
});
exports.getStorage = getStorage;
const saveStorage = (key, value) => {
    const newValue = (0, function_1.checkJSon)(value) ? value : JSON.stringify(value);
    clientRedis.set(key, newValue);
};
exports.saveStorage = saveStorage;
const getQueryTimeArray = (from, to, type) => {
    const getListTimeArray = (startTime, endTime, typeTime) => {
        const listTime = [];
        for (let i = startTime; i < endTime; i.add(1, typeTime)) {
            const endDate = (0, moment_1.default)(i).endOf(type);
            listTime.push({ start: new Date(i), end: new Date(endDate) });
        }
        return listTime;
    };
    let startDate = (0, moment_1.default)(parseInt(from)).startOf(type);
    let endDate = (0, moment_1.default)(parseInt(to)).endOf(type);
    if (type === 'week') {
        startDate = startDate.add(1, 'day');
        endDate = endDate.add(1, 'day');
    }
    const arrQueryTime = getListTimeArray(startDate, endDate, type);
    return arrQueryTime;
};
exports.getQueryTimeArray = getQueryTimeArray;
const getMatchTime = (type, time) => {
    const to = (0, moment_1.default)(time);
    let from;
    let matchTime;
    switch (type) {
        case 'week':
            from = (0, moment_1.default)(time).subtract(7, 'day');
            matchTime = {
                $gte: new Date(from.valueOf()),
                $lt: new Date(to.valueOf()),
            };
            break;
        case 'month':
            from = (0, moment_1.default)(time).subtract(1, 'month');
            matchTime = {
                $gte: new Date(from.valueOf()),
                $lt: new Date(to.valueOf()),
            };
            break;
        case 'all':
            matchTime = {
                $lt: new Date(to.valueOf()),
            };
            break;
        default:
            from = (0, moment_1.default)(time).subtract(1, 'day');
            matchTime = {
                $gte: new Date(from.valueOf()),
                $lt: new Date(to.valueOf()),
            };
            break;
    }
    return matchTime;
};
exports.getMatchTime = getMatchTime;
const getQueryChart = (type, time) => {
    const to = (0, moment_1.default)(time);
    let from;
    let matchTime;
    let interval;
    switch (type) {
        case 'month':
            interval = 'day';
            from = (0, moment_1.default)(time).subtract(1, 'month');
            matchTime = {
                $gte: new Date(from.valueOf()),
                $lt: new Date(to.valueOf()),
            };
            break;
        case 'all':
            interval = 'month';
            matchTime = {
                $lt: new Date(to.valueOf()),
            };
            break;
        default:
            interval = 'day';
            from = (0, moment_1.default)(time).subtract(7, 'day');
            matchTime = {
                $gte: new Date(from.valueOf()),
                $lt: new Date(to.valueOf()),
            };
            break;
    }
    return { matchTime, interval };
};
exports.getQueryChart = getQueryChart;
const getFiledDataDashboardResponse = (chart) => {
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
    return dataResponse;
};
exports.getFiledDataDashboardResponse = getFiledDataDashboardResponse;
const updateCacheRedislocal = (key, func, currentTime) => __awaiter(void 0, void 0, void 0, function* () {
    const payload = yield func();
    (0, exports.saveStorage)(key, JSON.stringify({ data: payload, time: currentTime }));
});
exports.updateCacheRedislocal = updateCacheRedislocal;
const fetchCacheRedisLocal = (key, time = 30000, func) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const currentTime = Date.now();
        const getData = yield (0, exports.getStorage)(key);
        if (getData && getData.data) {
            if ((currentTime - getData.time) > time) {
                (0, exports.updateCacheRedislocal)(key, func, currentTime);
            }
            return getData.data;
        }
        const payload = yield func();
        (0, exports.saveStorage)(key, JSON.stringify({ data: payload, time: currentTime }));
        return payload;
    }
    catch (error) {
        return null;
    }
});
exports.fetchCacheRedisLocal = fetchCacheRedisLocal;
const fetchCacheRedis = (key, req, next, time = 30000, func) => __awaiter(void 0, void 0, void 0, function* () {
    const currentTime = Date.now();
    const getData = yield (0, exports.getStorage)(key);
    if (getData && getData.data && ((currentTime - getData.time) <= time)) {
        req.response = getData.data;
        return next();
    }
    const isCacheData = (0, get_1.default)(getData, 'data');
    if (isCacheData) {
        req.response = getData.data;
        next();
    }
    func().then((payload) => {
        (0, exports.saveStorage)(key, { data: payload, time: currentTime });
        if (!isCacheData) {
            req.response = payload;
            next();
        }
    }).catch(() => {
        next();
    });
});
exports.fetchCacheRedis = fetchCacheRedis;
//# sourceMappingURL=index.js.map