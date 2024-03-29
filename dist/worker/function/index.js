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
exports.getDataSingleChain = exports.getDataDashBoard = exports.fetchCacheRedis = exports.fetchCacheRedisLocal = exports.updateCacheRedislocal = exports.getQueryChart = exports.getQueryTimeArray = exports.saveStorage = exports.getStorage = exports.deleteStore = exports.onlyUnique = exports.createSlug = exports.genSkipNum = exports.getLength = exports.genUpdate = void 0;
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
    let startDate = (0, moment_1.default)(from).startOf(type);
    let endDate = (0, moment_1.default)(to).endOf(type);
    if (type === 'week') {
        startDate = startDate.add(1, 'day');
        endDate = endDate.add(1, 'day');
    }
    const arrQueryTime = getListTimeArray(startDate, endDate, type);
    return arrQueryTime;
};
exports.getQueryTimeArray = getQueryTimeArray;
const getQueryChart = (type, time) => {
    const to = (0, moment_1.default)(time);
    let from;
    let matchTime;
    let interval;
    switch (type) {
        case 'day':
            interval = 'day';
            from = (0, moment_1.default)(time).subtract(7, 'day');
            matchTime = {
                $gte: new Date(from.valueOf()),
                $lt: new Date(to.valueOf()),
            };
            break;
        case 'week':
            from = (0, moment_1.default)(time).subtract(7, 'day');
            matchTime = {
                $gte: new Date(from.valueOf()),
                $lt: new Date(to.valueOf()),
            };
            break;
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
            break;
    }
    return { matchTime, interval };
};
exports.getQueryChart = getQueryChart;
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
const getDataDashBoard = (type, dashboardData14days) => {
    const totalData7days = dashboardData14days.slice(0, 7).reduce((total, item) => total + ((item === null || item === void 0 ? void 0 : item[type]) || 0), 0);
    const totalData7daysBefore = dashboardData14days.slice(7).reduce((total, item) => total + ((item === null || item === void 0 ? void 0 : item[type]) || 0), 0);
    return {
        total: totalData7days,
        percent: totalData7daysBefore ? ((totalData7days - totalData7daysBefore) / totalData7daysBefore) * 100 : 0,
    };
};
exports.getDataDashBoard = getDataDashBoard;
const getDataSingleChain = (type, dashboardData14days, chain) => {
    const totalData7days = dashboardData14days.slice(0, 7).filter((item) => item === null || item === void 0 ? void 0 : item[type]).map((item) => item[type]).flat();
    const data7daysChain = totalData7days.filter((item) => item.chain === chain).reduce((total, it) => total + (it.value || 0), 0);
    const totalData7daysBefore = dashboardData14days.slice(7).filter((item) => item === null || item === void 0 ? void 0 : item[type]).map((item) => item[type]).flat();
    const data7daysChainBefore = totalData7daysBefore.filter((item) => item.chain === chain).reduce((total, it) => total + (it.value || 0), 0);
    const percent = data7daysChainBefore ? ((data7daysChain - data7daysChainBefore) / data7daysChainBefore) * 100 : 0;
    return { total: data7daysChain, percent };
};
exports.getDataSingleChain = getDataSingleChain;
//# sourceMappingURL=index.js.map