/* eslint-disable no-param-reassign */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-shadow */
/* eslint-disable max-len */
// import moment from 'moment';
import { Response, NextFunction } from 'express';
import { getLength } from '../../common/function';
import { RequestCustom } from '../../middleware/constants';
import Interaction from '../../model/interaction/Interaction';
import {
  deleteStore, getStorage, onlyUnique, saveStorage,
} from '../function';
import { dappsInteractionType, lookupDapps } from './constant';
import DappsWorker from './index';
import { DappsType, ArrViewType } from '../../service/addaps/constants';

const allViewRediskeys = 'DAPPS_VIEW_CACHE_KEYS';
const allOpenRediskeys = 'DAPPS_OPEN_CACHE_KEYS';
export default class InteractionWorker {
  static async addViewWithUserLocal(slug: string, userId: string, isOpen: boolean = false) {
    const key: string = `DAPPS_${isOpen ? 'OPEN' : 'VIEW'}_${slug}`;
    InteractionWorker.addKeyCacheRedis(key, isOpen);

    const storageData: string[] = await getStorage(key);

    if (storageData) {
      const newData: string[] = storageData.concat([userId]);
      saveStorage(key, newData);
    } else {
      saveStorage(key, [userId]);
    }
  }

  static async addKeyCacheRedis(keyId: string, isOpen: boolean) {
    const cacheKey: string = isOpen ? allOpenRediskeys : allViewRediskeys;
    const getData: string[] = await getStorage(cacheKey);
    if (getData) {
      const newData: string[] = getData.concat([keyId]).filter(onlyUnique);
      saveStorage(cacheKey, newData);
    } else {
      saveStorage(cacheKey, [keyId]);
    }
  }

  static async addViewToDB(req: RequestCustom, res: Response, next: NextFunction) {
    const { type } = req.query;
    const cacheKey: string = type === 'open' ? allOpenRediskeys : allViewRediskeys;
    const allKeys: string[] = await getStorage(cacheKey);
    req.response = true;
    next();
    if (getLength(allKeys) > 0) {
      await allKeys.reduce(async (total, item: string) => {
        await total.then(async () => {
          const key: string = item;
          const viewData: string[] = await getStorage(key);
          const dappsId: string = item.replace('DAPPS_VIEW_', '').replace('DAPPS_OPEN_', '');
          if (dappsId === 'homeView') {
            const newData: { id: string, type: string, relatedID: number[]} = {
              id: dappsId,
              type: type === 'open' ? dappsInteractionType.openDapp : dappsInteractionType.dapps,
              relatedID: [getLength(viewData)],
            };
            await Interaction.create(newData);
            return;
          }
          const foundDapp: DappsType | false = await DappsWorker.getDappsByIdLocal(dappsId);
          if (!foundDapp) {
            return;
          }
          if (viewData) {
            const formatData: object = viewData.reduce((total, userId) => {
              total[userId] = (total[userId] || 0) + 1;
              return total;
            }, {});

            const inserData: { id: any, type: string, relatedID: number[], info: { userId: string } }[] = Object.keys(formatData).map((it) => {
              const newData = {
                id: foundDapp._id,
                type: type === 'open' ? dappsInteractionType.openDapp : dappsInteractionType.dapps,
                relatedID: [formatData[it]],
                info: {
                  userId: it,
                },
              };
              return newData;
            });

            await Interaction.insertMany(inserData);
            deleteStore(key);
          }
        });
      }, Promise.resolve());
      await InteractionWorker.clearKeyViewRedisLocal(type === 'open');
    }
  }

  static async clearKeyViewRedisLocal(isOpen: boolean) {
    if (isOpen) {
      saveStorage(allOpenRediskeys, []);
    } else {
      saveStorage(allViewRediskeys, []);
    }
  }

  static async getTopViewLocal(type: string, page: any = 1, size: any = 5, startTime: number = 0, endtime: number = Date.now()): Promise<DappsType[]> {
    const matchState = {
      createdAt: {
        $gte: new Date(startTime),
        $lte: new Date(endtime),
      },
      id: { $ne: 'homeView' },
      type,
    };
    const payload: { _id: any, dapps: DappsType, view :number }[] = await Interaction.aggregate([
      {
        $match: matchState,
      },
      {
        $group: {
          _id: '$id',
          view: { $sum: { $first: '$relatedID' } },
        },
      },
      {
        $sort: {
          view: -1,
        },
      },
      {
        $limit: parseInt(size) * parseInt(page),
      },
      {
        $lookup: lookupDapps,
      },
      {
        $unwind: '$dapps',
      },
    ]);

    if (getLength(payload) < (parseInt(size) * parseInt(page))) {
      const moreData: DappsType[] = await DappsWorker.getDappsOfgenreLocal(null, null, (parseInt(size) * parseInt(page)) - getLength(payload), payload.map((it) => it.dapps.slug));

      if (startTime !== 0) {
        const allView: ArrViewType[] = await InteractionWorker.getViewOfIdLocal(payload.map((it) => it.dapps).concat(moreData).slice((parseInt(page) - 1) * parseInt(size), parseInt(size) * parseInt(page)).map((it) => it._id));
        return payload.map((it) => it.dapps).concat(moreData).slice((parseInt(page) - 1) * parseInt(size), parseInt(size) * parseInt(page)).map((it) => {
          const foundView: ArrViewType = allView.find((view) => view._id === it._id.toString());
          return { view: foundView ? foundView.view : 0, ...it };
        });
      }
      return payload.map((it) => it.dapps).concat(moreData).slice((parseInt(page) - 1) * parseInt(size), parseInt(size) * parseInt(page)).map((it) => {
        const foundView: { _id: any, dapps: DappsType, view: number } = payload.find((view) => view._id === it._id.toString());
        return { view: foundView ? foundView.view : 0, ...it };
      });
    }

    if (startTime !== 0) {
      const allView: ArrViewType[] = await InteractionWorker.getViewOfIdLocal(payload.map((it) => it.dapps._id));
      return payload.map((it) => it.dapps).map((it) => {
        const foundView: ArrViewType = allView.find((view) => view._id === it._id.toString());
        return { view: foundView ? foundView.view : 0, ...it };
      });
    }
    return payload.map((it) => it.dapps).map((it) => {
      const foundView: { _id: any, dapps: DappsType, view: number } = payload.find((view) => view._id === it._id.toString());
      return { view: foundView ? foundView.view : 0, ...it };
    });
  }

  static async getViewOfIdLocal(arrId: any[], type: string = null, startDate: Date = new Date(0)): Promise<ArrViewType[]> {
    const matchState: { id: {$in: string[]}, createdAt: { $gte: Date}, type: { $in: string[]} | string } = {
      id: { $in: arrId.map((it) => it.toString()) },
      createdAt: { $gte: startDate },
      type: { $in: [dappsInteractionType.dapps, dappsInteractionType.openDapp] },
    };

    if (type) {
      matchState.type = type;
    }

    const payload = await Interaction.aggregate([
      {
        $match: matchState,
      },
      {
        $group: {
          _id: '$id',
          view: { $sum: { $first: '$relatedID' } },
        },
      },
      {
        $sort: {
          view: -1,
        },
      },
    ]);
    return payload;
  }

  static async getUserDappsLocal(userId: string): Promise<{ _id: string, totalView: number }[]> {
    const matchState = {
      type: { $in: [dappsInteractionType.dapps, dappsInteractionType.openDapp] },
      'info.userId': userId,
    };

    const payload: { _id: string, totalView: number }[] = await Interaction.aggregate([
      {
        $match: matchState,
      },
      {
        $group: {
          _id: '$id',
          totalView: { $sum: { $first: '$relatedID' } },
        },
      },
      {
        $sort: {
          totalView: -1,
        },
      },
    ]);

    return payload;
  }

  static async addViewOpenDapps(req: RequestCustom, res: Response, next: NextFunction) {
    const { slug } = req.body;
    const { user } = req;
    InteractionWorker.addViewWithUserLocal(slug, user, true);
    req.response = true;
    next();
  }
}
