/* eslint-disable no-underscore-dangle */
/* eslint-disable max-len */
import { Response, NextFunction } from 'express';
import moment from 'moment';
import { RequestCustom } from '../../middleware/constants';
import DashboardData from '../../model/dashboardData/DashboardData';
import User from '../../model/user/User';
import KYCVerify from '../../model/user/KYCVerify';
import IPUser from '../../model/user/IPUser';
import DeviceSource from '../../model/DeviceSource/DeviceSource';
import {
  getMatchTime, getQueryTimeArray, getQueryChart, getFiledDataDashboardResponse,
} from '../function/index';
import AddressList from '../../model/addressList/AddressList';
import DagoraHistory from '../../model/dagora/dagoraHistory';
import AggregatorHistory from '../../model/aggregatorHistory/AggregatorHistory';

export default class AnalyticSupperAppWorker {
  // DashBoard
  static async getTotalDashboardData(req: RequestCustom, res: Response, next: NextFunction) {
    const time = new Date().getTime();
    const to = moment(time);
    const from = moment(time).subtract(14, 'day');
    const dashboardData14days: any = await DashboardData.find({
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

    const getData = (type: string) => {
      const totalData7days = dashboardData14days.slice(0, 7).reduce((total, item: any) => total + (item?.[type] || 0), 0);
      const totalData7daysBefore = dashboardData14days.slice(7).reduce((total, item: any) => total + (item?.[type] || 0), 0);
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
      totalUserSummary: dashboardData14days[0]?.userTotal || 0,
      totalAddressSummary: dashboardData14days[0]?.addressTotal || 0,
      XPoint: dashboardData14days[0]?.pointTotal || 0,
    };
    next();
  }

  static async getChartDashboard(req: RequestCustom, res: Response, next: NextFunction) {
    const time = new Date().getTime();
    const { type, chart } = req.query;

    const { matchTime, interval } = getQueryChart(type, time);

    const dataResponse = getFiledDataDashboardResponse(chart);

    const dashboardData: any = await DashboardData.find({
      interval,
      startAt: matchTime,
    }, dataResponse).sort({ startAt: 1 }).lean();

    req.response = dashboardData;
    next();
  }

  // User
  static async getUserDashboard(req: RequestCustom, res: Response, next: NextFunction) {
    const time = new Date().getTime();
    const { type } = req.query;
    const matchTime = getMatchTime(type, time);
    const userDataTotalPromise = User.countDocuments({
      createdAt: matchTime,
    }).lean();

    const userKCYPromise = KYCVerify.countDocuments({
      createdAt: matchTime,
      status: 'verified',
    }).lean();

    const [totalUser, kycUser] = await Promise.all([userDataTotalPromise, userKCYPromise]);
    req.response = {
      totalUser,
      newUser: totalUser - kycUser,
      kycUser,
    };
    next();
  }

  static async getPopularCountries(req: RequestCustom, res: Response, next: NextFunction) {
    const time = new Date().getTime();
    const { type } = req.query;
    const matchTime = getMatchTime(type, time);
    const dataCountries = await IPUser.aggregate([
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
  }

  static async getDeviceDashboard(req: RequestCustom, res: Response, next: NextFunction) {
    const time = new Date().getTime();
    const { type } = req.query;
    const to: any = moment(time);
    let from;
    let arrQueryTime;

    switch (type) {
      case 'week':
        from = moment(time).subtract(7, 'day');
        arrQueryTime = getQueryTimeArray(from.valueOf(), to.valueOf(), 'day').slice(1);
        break;

      case 'month':
        from = moment(time).subtract(1, 'month');
        arrQueryTime = getQueryTimeArray(from.valueOf(), to.valueOf(), 'day').slice(1);
        break;

      case 'all':
        from = moment((await DeviceSource.aggregate(
          [
            {
              $group:
              {
                _id: null,
                minTime: { $min: '$createdAt' },
              },
            },
          ],
        ))[0].minTime);
        arrQueryTime = getQueryTimeArray(from.valueOf(), to.valueOf(), 'month');
        break;

      default:
        from = moment(time).subtract(1, 'day');
        arrQueryTime = getQueryTimeArray(from.valueOf(), to.valueOf(), 'hour').slice(1);
        break;
    }

    const deviceSourceData = await DeviceSource.find({
      createdAt: { $gte: arrQueryTime[0]?.start, $lte: arrQueryTime[arrQueryTime.length - 1]?.end },
    }, { _id: 0, os: 1, createdAt: 1 }).lean();

    const getTotalData = (start: Date, end: Date, os: string) : number => deviceSourceData.filter(
      (item: any) => item.createdAt >= start && item.createdAt <= end && item.os === os,
    ).length;

    const dataResponse = arrQueryTime.map((item) => ({
      time: item.start,
      ios: getTotalData(item.start, item.end, 'ios'),
      android: getTotalData(item.start, item.end, 'android'),
    }));

    req.response = dataResponse;
    next();
  }

  // Wallet
  static async getWalletDashboard(req: RequestCustom, res: Response, next: NextFunction) {
    // return: wallet User( total, percent), total wallet created (total, percent), total wallet, total transfer volume, total transfer transaction
    const time = new Date().getTime();
    const to = moment(time);
    const from = moment(time).subtract(14, 'day');

    const dashboardData14daysPromise: any = DashboardData.find({
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

    const addressData7daysPromise: any = AddressList.find({
      createdAt: {
        $gte: new Date(moment(time).subtract(7, 'day').valueOf()),
        $lt: new Date(to.valueOf()),
      },
    }, { _id: 0, createdAt: 1, createdUser: 1 }).sort({ createdAt: -1 }).lean();

    const addressData7daysBeforePromise: any = AddressList.find({
      createdAt: {
        $gte: new Date(moment(time).subtract(14, 'day').valueOf()),
        $lt: new Date(moment(time).subtract(7, 'day').valueOf()),
      },
    }, { _id: 0, createdAt: 1, createdUser: 1 }).sort({ createdAt: -1 }).lean();

    const [dashboardData14days, addressData7days, addressData7daysBefore] = await Promise.all([dashboardData14daysPromise, addressData7daysPromise, addressData7daysBeforePromise]);

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
  }

  static async getWalletChart(req: RequestCustom, res: Response, next: NextFunction) {
    const time = new Date().getTime();
    const { type, chart } = req.query;

    const { matchTime, interval } = getQueryChart(type, time);

    const dataResponse = getFiledDataDashboardResponse(chart);

    const dashboardData: any = await DashboardData.find({
      interval,
      startAt: matchTime,
    }, dataResponse).sort({ startAt: 1 }).lean();

    req.response = dashboardData;
    next();
  }

  static async getWalletCreateNewAndRestore(req: RequestCustom, res: Response, next: NextFunction) {
    const time = new Date().getTime();
    const { type } = req.query;
    const matchTime = getMatchTime(type, time);
    const createNewTotalPromise = AddressList.countDocuments({ createdAt: matchTime, numCreated: { $lte: 1 } }).lean();
    const createNewMultiTotalPromise = AddressList.countDocuments({ createdAt: matchTime, numCreated: { $lte: 1 }, isMulti: false }).lean();
    const createNewSingleChainDetailPromise = AddressList.aggregate([
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

    const restoreTotalPromise = AddressList.countDocuments({ createdAt: matchTime, numCreated: { $gt: 1 } }).lean();
    const restoreMultiTotalPromise = AddressList.countDocuments({ createdAt: matchTime, numCreated: { $gt: 1 }, isMulti: false }).lean();
    const restoreSingleChainDetailPromise = AddressList.aggregate([
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

    const [createNewTotal, createNewMultiTotal, createNewSingleChainDetail, restoreTotal, restoreMultiTotal, restoreSingleChainDetail] = await Promise.all([createNewTotalPromise, createNewMultiTotalPromise, createNewSingleChainDetailPromise, restoreTotalPromise, restoreMultiTotalPromise, restoreSingleChainDetailPromise]);
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
  }

  static async getDetailTransaction(req: RequestCustom, res: Response, next: NextFunction) {
    const time = new Date().getTime();
    const { type, limit = 10, page = 1 } = req.query;

    const { matchTime } = getQueryChart(type, time);
    const dagoraHistoryData = await DagoraHistory.aggregate([
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
  }

  // Swap dashboard
  static async getSwapDashboard(req: RequestCustom, res: Response, next: NextFunction) {
    const time = new Date().getTime();
    const to = moment(time);
    const from = moment(time).subtract(14, 'day');

    const { chain = 'all' } = req.query;

    const dashboardData14days: any = await DashboardData.find({
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

    const getDataAllChain = (type: string) => {
      const totalData7days = dashboardData14days.slice(0, 7).reduce((total, item: any) => total + (item?.[type] || 0), 0);
      const totalData7daysBefore = dashboardData14days.slice(7).reduce((total, item: any) => total + (item?.[type] || 0), 0);
      return {
        total: totalData7days,
        percent: totalData7daysBefore ? ((totalData7days - totalData7daysBefore) / totalData7daysBefore) * 100 : 0,
      };
    };

    const getDataSingleChain = (type: string) => {
      const totalData7days = dashboardData14days.slice(0, 7).filter((item) => item?.[type]).map((item) => item[type]).flat();
      const data7daysChain = totalData7days.filter((item) => item.chain === chain).reduce((total, it) => total + (it.value || 0), 0);
      const totalData7daysBefore = dashboardData14days.slice(7).filter((item) => item?.[type]).map((item) => item[type]).flat();
      const data7daysChainBefore = totalData7daysBefore.filter((item) => item.chain === chain).reduce((total, it) => total + (it.value || 0), 0);
      const percent = data7daysChainBefore ? ((data7daysChain - data7daysChainBefore) / data7daysChainBefore) * 100 : 0;
      return { total: data7daysChain, percent };
    };

    if (chain === 'all') {
      const swapUserData7daysPromise = AggregatorHistory.aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(moment(time).subtract(7, 'day').valueOf()),
              $lt: new Date(moment(time).valueOf()),
            },
          },
        },
        {
          $group: {
            _id: '$createdUser',
          },
        },
      ]);

      const swapUserData7daysBeforePromise = AggregatorHistory.aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(moment(time).subtract(14, 'day').valueOf()),
              $lt: new Date(moment(time).subtract(7, 'day').valueOf()),
            },
          },
        },
        {
          $group: {
            _id: '$createdUser',
          },
        },
      ]);

      const swapAddressData7daysPromise = AggregatorHistory.aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(moment(time).subtract(7, 'day').valueOf()),
              $lt: new Date(moment(time).valueOf()),
            },
          },
        },
        {
          $group: {
            _id: '$from',
          },
        },
      ]);

      const swapAddressData7daysBeforePromise = AggregatorHistory.aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(moment(time).subtract(14, 'day').valueOf()),
              $lt: new Date(moment(time).subtract(7, 'day').valueOf()),
            },
          },
        },
        {
          $group: {
            _id: '$from',
          },
        },
      ]);

      const [swapUserData7days, swapUserData7daysBefore, swapAddressData7days, swapAddressData7daysBefore] = await Promise.all([swapUserData7daysPromise, swapUserData7daysBeforePromise, swapAddressData7daysPromise, swapAddressData7daysBeforePromise]);

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

        swapVolume: dashboardData14days[0]?.swapVolumeTotal || 0,
        swapTransaction: dashboardData14days[0]?.swapCountTotal || 0,
      };
    } else {
      const swapUserData7daysPromise = AggregatorHistory.aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(moment(time).subtract(7, 'day').valueOf()),
              $lt: new Date(moment(time).valueOf()),
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

      const swapUserData7daysBeforePromise = AggregatorHistory.aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(moment(time).subtract(14, 'day').valueOf()),
              $lt: new Date(moment(time).subtract(7, 'day').valueOf()),
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

      const swapAddressData7daysPromise = AggregatorHistory.aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(moment(time).subtract(7, 'day').valueOf()),
              $lt: new Date(moment(time).valueOf()),
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

      const swapAddressData7daysBeforePromise = AggregatorHistory.aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(moment(time).subtract(14, 'day').valueOf()),
              $lt: new Date(moment(time).subtract(7, 'day').valueOf()),
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

      const [swapUserData7days, swapUserData7daysBefore, swapAddressData7days, swapAddressData7daysBefore] = await Promise.all([swapUserData7daysPromise, swapUserData7daysBeforePromise, swapAddressData7daysPromise, swapAddressData7daysBeforePromise]);

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
        swapVolume: dashboardData14days[0]?.swapVolumeTotal || 0,
        swapTransaction: dashboardData14days[0]?.swapCountTotal || 0,
      };
    }

    next();
  }

  static async getSwapChart(req: RequestCustom, res: Response, next: NextFunction) {
    const time = new Date().getTime();
    const { type, chart } = req.query;

    const { matchTime, interval } = getQueryChart(type, time);

    const dataResponse = getFiledDataDashboardResponse(chart);

    const dashboardData: any = await DashboardData.find({
      interval,
      startAt: matchTime,
    }, dataResponse).sort({ startAt: 1 }).lean();

    req.response = dashboardData;
    next();
  }

  static async getTopTokenSwap(req: RequestCustom, res: Response, next: NextFunction) {
    const time = new Date().getTime();
    const { type, chain = 'all' } = req.query;
    const matchTime = getMatchTime(type, time);
    let match;
    if (chain === 'all') {
      match = {
        createdAt: matchTime,
      };
    } else {
      match = {
        createdAt: matchTime,
        chain,
      };
    }
    const aggregatorHistoryDataToken0 = await AggregatorHistory.aggregate([
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

    const aggregatorHistoryDataToken1 = await AggregatorHistory.aggregate([
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
      return { symbol: item, volume: (dataToken0?.volume || 0) + (dataToken1?.volume || 0) };
    }).sort((a, b) => b.volume - a.volume).slice(0, 5);
    req.response = aggregatorHistoryData;
    next();
  }

  // update dashboardData
  static async updateDashboardData(req: RequestCustom, res: Response, next: NextFunction) {
    const { from, to } = req.query;
    const arrayTimeDay = getQueryTimeArray(from, to, 'day');
    const arrayTimeWeek = getQueryTimeArray(from, to, 'week');
    const arrayTimeMonth = getQueryTimeArray(from, to, 'month');

    const createAndUpdateDashboardData = async (arrayTime, interval) => {
      await Promise.all(arrayTime.map(async (time) => {
        const swapUser = (await AggregatorHistory.aggregate([
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

        const swapAddress = (await AggregatorHistory.aggregate([
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

        const listChain = await AggregatorHistory.aggregate([
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

        const dataSummary = await Promise.all(listChain.map(async (chain) => {
          const dataUserChain = await AggregatorHistory.aggregate([
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

          const dataAddressChain = await AggregatorHistory.aggregate([
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
        }));

        const swapUserSummary = dataSummary.map((item) => item.swapUser);
        const swapAddressSummary = dataSummary.map((item) => item.swapAddress);

        const findDataDashBoard = await DashboardData.findOne({ id: `${interval}_${time.start.getTime()}_${time.end.getTime()}` });
        if (!findDataDashBoard) {
          await DashboardData.create({
            id: `${interval}_${time.start.getTime()}_${time.end.getTime()}`,
            interval,
            swapUser,
            swapAddress,
            swapUserSummary,
            swapAddressSummary,
            startAt: time.start,
            endAt: time.end,
          });
        } else {
          await findDataDashBoard.updateOne({
            swapUser,
            swapAddress,
            swapUserSummary,
            swapAddressSummary,
          });
        }
      }));
    };

    createAndUpdateDashboardData(arrayTimeDay, 'day');
    createAndUpdateDashboardData(arrayTimeWeek, 'week');
    createAndUpdateDashboardData(arrayTimeMonth, 'month');

    req.response = true;
    next();
  }
}
