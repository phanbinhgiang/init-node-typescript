/* eslint-disable max-len */
/* eslint-disable consistent-return */
/* eslint-disable default-param-last */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable arrow-body-style */
/* eslint-disable array-callback-return */
/* eslint-disable import/prefer-default-export */
import slug from 'slug';
import { createClient } from 'redis';
import moment from 'moment';
import get from 'lodash/get';
import { checkJSon } from '../../common/function';
import { DurationTime } from '../dagora/dagoraHistory';

export const genUpdate = (data: object, arrValue: string[]) : any => {
  const genObject = {};
  arrValue.map((itm) => {
    if (data[itm] !== undefined && data[itm] !== null) {
      genObject[itm] = data[itm];
    }
  });
  return Object.keys(genObject)[0] ? genObject : false;
};

export const getLength = (value: any) : number => {
  return value ? value.length : 0;
};

export const genSkipNum = (page, size) => {
  return (parseInt(page) - 1) * parseInt(size);
};

export const createSlug = (text: string): string => {
  return slug(text);
};

export const onlyUnique = (value, index, self) => {
  return self.indexOf(value) === index;
};

const clientRedis = createClient();
const connectRedis = async () => {
  await clientRedis.connect();
};
connectRedis();

export const deleteStore = (key: string) => {
  clientRedis.del(key);
};

export const getStorage = async (key: string): Promise<any> => {
  try {
    const data: string = await clientRedis.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    return null;
  }
};

export const saveStorage = (key: string, value: any) => {
  const newValue: string = checkJSon(value) ? value : JSON.stringify(value);
  clientRedis.set(key, newValue);
};

export const getQueryTimeArray = (from: string, to: string, type: any) => {
  const getListTimeArray = (startTime: any, endTime: any, typeTime: any) => {
    const listTime: DurationTime[] = [];
    for (let i = startTime; i < endTime; i.add(1, typeTime)) {
      const endDate: any = moment(i).endOf(type);
      listTime.push({ start: new Date(i), end: new Date(endDate) });
    }
    return listTime;
  };
  let startDate = moment(parseInt(from)).startOf(type);
  let endDate = moment(parseInt(to)).endOf(type);
  if (type === 'week') {
    startDate = startDate.add(1, 'day');
    endDate = endDate.add(1, 'day');
  }
  const arrQueryTime = getListTimeArray(startDate, endDate, type);
  return arrQueryTime;
};

export const getMatchTime = (type, time) => {
  const to = moment(time);
  let from;
  let matchTime;
  switch (type) {
    case 'week':
      from = moment(time).subtract(7, 'day');
      matchTime = {
        $gt: new Date(from.valueOf()),
        $lte: new Date(to.valueOf()),
      };
      break;

    case 'month':
      from = moment(time).subtract(1, 'month');
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
      from = moment(time).subtract(1, 'day');
      matchTime = {
        $gt: new Date(from.valueOf()),
        $lte: new Date(to.valueOf()),
      };
      break;
  }
  return matchTime;
};

export const updateCacheRedislocal = async (key, func, currentTime) => {
  const payload = await func();
  saveStorage(key, JSON.stringify({ data: payload, time: currentTime }));
};

export const fetchCacheRedisLocal = async (key: string, time: number = 30000, func: any): Promise<any> => {
  try {
    const currentTime: number = Date.now();

    const getData: any = await getStorage(key);
    if (getData && getData.data) {
      if ((currentTime - getData.time) > time) {
        updateCacheRedislocal(key, func, currentTime);
      }

      return getData.data;
    }

    const payload = await func();
    saveStorage(key, JSON.stringify({ data: payload, time: currentTime }));
    return payload;
  } catch (error) {
    return null;
  }
};

export const fetchCacheRedis = async (key, req, next, time = 30000, func) => {
  const currentTime = Date.now();

  const getData = await getStorage(key);
  if (getData && getData.data && ((currentTime - getData.time) <= time)) {
    req.response = getData.data;
    return next();
  }
  const isCacheData = get(getData, 'data');
  if (isCacheData) {
    req.response = getData.data;
    next();
  }
  func().then((payload) => {
    saveStorage(key, { data: payload, time: currentTime });
    if (!isCacheData) {
      req.response = payload;
      next();
    }
  }).catch(() => {
    next();
  });
};
