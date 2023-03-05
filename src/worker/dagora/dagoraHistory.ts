/* eslint-disable max-len */
/* eslint-disable func-names */
/* eslint-disable no-param-reassign */
// import { Response, NextFunction } from 'express';
import { ObjectId } from 'mongoose';
import get from 'lodash/get';
// import { testSolona } from 'notification';
import DarogaHistory from '../../model/dagora/dagoraHistory';
import DagoraReport from '../../model/dagora/DagoraReport';
import Interaction from '../../model/interaction/Interaction';
import { getQueryTimeArray } from '../function/index';

interface DagoraHistory {
  dateStart: Date,
  dateEnd: Date,
  type: string,
  volumeAddressToken?: { tokenAddress: string, volume: number}[],
  totalTransaction: number,
  totalViews?: { type: string, views: number }[],
  topViews?: { id: string, views: number }[],
  topBuyer?: {from: string, volume: number }[],
  volumeAll: number,
  volumeChain?: {chain: string, volume: number}[],
  topSeller?: {owner: string, volume: number}[],
  topCollection?: {address: string, chain: string, volume: number}[],
  totalTx?: number,
  avaPrice?: number,
}

export interface DurationTime {
  start: Date, end: Date
}

export interface DataFilter {
  _id: any
  id?: string
  address?: string
  chain?: string
  price?: number
  createdAt?: Date
  tokenAddress?: string,
  from?: string,
  type?: string,
  relatedID?: number[],
  owner?: string,
  publishDate?:number,
}

export default class DagoraHistoryWorker {
  static async postDagoraHistory(data: DagoraHistory) {
    // create and update data
    const dataFind = await DagoraReport.findOne({
      dateStart: data.dateStart,
      dateEnd: data.dateEnd,
      type: data.type,
    }, '_id');
    if (dataFind === null) {
      await DagoraReport.create(data);
    } else {
      await dataFind.updateOne(data);
    }
  }

  static async callDagoraReport(req, res, next) {
    const { from, to, type } = req.query;
    const arrQueryTime: DurationTime[] = getQueryTimeArray(from, to, type);
    const dataDagoraHistoryPromise = DarogaHistory.find({
      createdAt: { $gte: arrQueryTime[0]?.start, $lte: arrQueryTime[arrQueryTime.length - 1]?.end },
      type: { $in: ['buy', 'sell', 'endBid'] },
    }, 'from type price createdAt tokenAddress address chain owner').sort({ createdAt: 1 }).lean();
    const dataInteractionsPromise = Interaction.find({
      createdAt: { $gte: arrQueryTime[0]?.start, $lte: arrQueryTime[arrQueryTime.length - 1]?.end },
      type: { $in: ['nftView', 'collectionView', 'bundleView', 'launchpadView', 'userView'] },
    }, 'id type relatedID createdAt').lean();

    const [dataDagoraHistory, dataInteractions] = await Promise.all(
      [dataDagoraHistoryPromise, dataInteractionsPromise],
    );
    const getDataVolumeAddressToken = (start: Date, end: Date):
    { tokenAddress: string, volume: number}[] => Object.values(dataDagoraHistory.filter(
      (item: DataFilter) => item.createdAt >= start && item.createdAt < end,
    ).reduce((total, item: DataFilter) => {
      const { tokenAddress, price } = item;
      total[tokenAddress] = { tokenAddress, volume: get(total[tokenAddress], 'volume', 0) + price };
      return total;
    }, {}));

    const getTotalTxData = (start: Date, end: Date) : number => dataDagoraHistory.filter(
      (item: DataFilter) => item.createdAt >= start && item.createdAt < end,
    ).length;

    const getDataTopBuyer = (start: Date, end: Date):
    {from: string, volume: number }[] => Object.values(dataDagoraHistory.filter(
      (item: DataFilter) => item.from?.length
      && item.createdAt >= start && item.createdAt < end,
    ).reduce((total, item: DataFilter) => {
      const { from: fromID, price } = item;
      total[fromID] = { fromID, volume: get(total[fromID], 'volume', 0) + price };
      return total;
    }, {}));

    const getTotalViews = (start: Date, end: Date):
    { type: string, views: number }[] => Object.values(dataInteractions.filter(
      (item: DataFilter) => item.createdAt >= start && item.createdAt < end,
    ).reduce((total, item: DataFilter) => {
      const { type: typeView, relatedID } = item;
      total[typeView] = { typeView, views: get(total[typeView], 'views', 0) + relatedID[0] };
      return total;
    }, {}));

    const getTopViews = (start: Date, end: Date):
    { id: string, views: number }[] => Object.values(dataInteractions.filter(
      (item: DataFilter) => item.createdAt >= start && item.createdAt < end,
    ).reduce((total, item: DataFilter) => {
      const { id, relatedID } = item;
      total[id] = { id, views: get(total[id], 'views', 0) + relatedID[0] };
      return total;
    }, {}));

    const getDataVolumeAll = (start: Date, end: Date): number => dataDagoraHistory.filter(
      (item: { _id: ObjectId, createdAt: Date}) => item.createdAt >= start && item.createdAt < end,
    ).reduce((total, item: { _id: number, price: number}) => total + item.price, 0);

    const getDataVolumeChains = (start: Date, end: Date):
    {chain: string, volume: number}[] => Object.values(dataDagoraHistory.filter(
      (item: DataFilter) => item.createdAt >= start && item.createdAt < end,
    ).reduce((total, item: DataFilter) => {
      const { chain, price } = item;
      total[chain] = { chain, volume: get(total[chain], 'volume', 0) + price };
      return total;
    }, {}));

    const getDataTopSeller = (start: Date, end: Date):
    {owner: string, volume: number}[] => Object.values(dataDagoraHistory.filter(
      (item: DataFilter) => item.owner?.length && item.createdAt >= start && item.createdAt < end,
    ).reduce((total, item: DataFilter) => {
      const { owner, price } = item;
      total[owner] = { owner, volume: get(total[owner], 'volume', 0) + price };
      return total;
    }, {}));

    const getDataTopCollection = (start: Date, end: Date):
    {address: string, chain: string, volume: number}[] => Object.values(dataDagoraHistory.filter(
      (item: DataFilter) => item.createdAt >= start && item.createdAt < end,
    ).reduce((total, item: DataFilter) => {
      const { address, price, chain } = item;
      total[address] = { address, chain, volume: get(total[address], 'volume', 0) + price };
      return total;
    }, {}));

    const dataResponse: DagoraHistory[] = arrQueryTime.map((item) => (
      {
        dateStart: item.start,
        dateEnd: item.end,
        type,
        volumeAddressToken: getDataVolumeAddressToken(item.start, item.end),
        totalTransaction: getTotalTxData(item.start, item.end),
        totalViews: getTotalViews(item.start, item.end),
        topViews: getTopViews(item.start, item.end).sort((a, b) => b.views - a.views).slice(0, 10),
        topBuyer: getDataTopBuyer(item.start, item.end).sort(
          (a, b) => b.volume - a.volume,
        ).slice(0, 10),
        volumeAll: getDataVolumeAll(item.start, item.end),
        volumeChain: getDataVolumeChains(item.start, item.end),
        topSeller: getDataTopSeller(item.start, item.end).sort(
          (a, b) => b.volume - a.volume,
        ).slice(0, 10),
        topCollection: getDataTopCollection(item.start, item.end).sort(
          (a, b) => b.volume - a.volume,
        ).slice(0, 10),
        totalTx: getTotalTxData(item.start, item.end),
        avaPrice: (
          getDataVolumeAll(item.start, item.end) / getTotalTxData(item.start, item.end) || 0),
      }
    ));

    dataResponse.forEach(async (item) => {
      await DagoraHistoryWorker.postDagoraHistory(item);
    });

    req.response = dataResponse;
    next();
  }

  static async getDataDagoraReportField(req, res, next) {
    const {
      from, to, type, field,
    } = req.query;

    const arrQueryTime: DurationTime[] = getQueryTimeArray(from, to, type);

    const dataResponse: DagoraHistory[] = await DagoraReport.find({
      dateStart: { $gte: arrQueryTime[0]?.start, $lte: arrQueryTime[arrQueryTime.length - 1]?.end },
      type,
    }, `dateStart dateEnd type ${field.replaceAll(' ', '').replaceAll(',', ' ')}`).sort({ dateStart: 1 }).lean();
    req.response = dataResponse;
    next();
  }
}
