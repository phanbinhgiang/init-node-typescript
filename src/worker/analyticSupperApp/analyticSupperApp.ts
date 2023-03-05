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
import { getQueryTimeArray } from '../function/index';

export default class AnalyticSupperAppWorker {
  static async getTotalDashboardData(req: RequestCustom, res: Response, next: NextFunction) {
    const time = 1656954000000;
    const to = moment(time);
    const from = moment(time).subtract(14, 'day');
    const dashboardData14days: any = await DashboardData.find({
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
    const time = 1656954000000;
    const { type, chart } = req.query;
    const to = moment(time);
    let from;
    let matchTime;

    switch (type) {
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
        from = moment(time).subtract(7, 'day');
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
    const dashboardData: any = await DashboardData.find({
      interval: 'day',
      startAt: matchTime,
    }, dataResponse).sort({ startAt: 1 }).lean();

    req.response = dashboardData;
    next();
  }

  static getMatchTime(type, time) {
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
  }

  static async getUserDashboard(req: RequestCustom, res: Response, next: NextFunction) {
    const time = 1656954000000;
    const { type } = req.query;
    const matchTime = AnalyticSupperAppWorker.getMatchTime(type, time);
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
    const matchTime = AnalyticSupperAppWorker.getMatchTime(type, time);
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
      type,
      ios: getTotalData(item.start, item.end, 'ios'),
      android: getTotalData(item.start, item.end, 'android'),
    }));

    req.response = {
      arrQueryTime: arrQueryTime.length,
      dataResponse,
    };
    next();
  }
}
