/* eslint-disable consistent-return */
/* eslint-disable prefer-spread */
/* eslint-disable default-param-last */
/* eslint-disable no-param-reassign */
/* eslint-disable no-underscore-dangle */
/* eslint-disable max-len */
import moment from 'moment';
import random from 'lodash/random';
import { Response, NextFunction } from 'express';
import { ObjectId } from 'mongoose';
import {
  createSlug, genUpdate, getLength,
  fetchCacheRedis, genSkipNum, getStorage, onlyUnique,
} from '../function';
// import { Dapps, Genre } from '../../../model'
import Dapps from '../../model/dapps/Dapps';
import Genre from '../../model/dapps/Genre';
import DappsInteractionWorker from './dappsInteraction';
import { dappFilter, dappsInteractionType } from './constant';
import DappInteraction from '../../model/interaction/Interaction';
import { DappsType, GenreType, ArrViewType } from '../../service/addaps/constants';
import { MatchStateType } from '../../service/knowledge/constants';
import { RequestCustom } from '../../middleware/constants';

export default class DappWorker {
  static async getHome(req: RequestCustom, res: Response, next: NextFunction) {
    const { chain } = req.query;
    const key: string = `DAPP_BROWER_HOME_V2${getLength(chain) > 0 ? chain : ''}`;
    DappsInteractionWorker.addViewWithUserLocal('homeView', '');

    fetchCacheRedis(key, req, next, 5 * 60 * 1000, async () => {
      const arrGenre: GenreType[] = await Genre.find({ isActive: true, $or: [{ source: '' }, { source: { $exists: false } }] }, { slug: 1, title: 1 }).sort({ weight: -1 });
      const finalData:{ genre: GenreType, dapps: any }[] = await Promise.all(arrGenre.map(async (it) => {
        const dappsPayload = await DappWorker.getTopViewDappOfGenreLocal(it._id.toString(), chain, 1, 15);
        return {
          genre: it,
          dapps: dappsPayload,
        };
      }));
      return finalData;
    });
  }

  static async getHomeSide(req: RequestCustom, res: Response, next: NextFunction) {
    const { page = 1, size = 15, chain } = req.query;
    const key: string = `DAPP_BROWER_HOME_ADDITIONAL_${page}_${size}_${chain}`;
    fetchCacheRedis(key, req, next, 5 * 60 * 1000, async () => {
      const matchState: MatchStateType = { isActive: true };
      if (getLength(chain) > 0) {
        matchState.chain = chain;
      }
      const pinndedMatchState: MatchStateType = { isPinned: true, ...matchState };

      const arrDapp: DappsType[] = await Dapps.find(matchState, dappFilter).lean();
      const pinnedDapps: DappsType[] = await Dapps.find(pinndedMatchState, dappFilter).sort({ weight: -1 }).limit(parseInt(size)).lean();

      // get view of all data
      const arrViewTrending: ArrViewType[] = await DappsInteractionWorker.getViewOfIdLocal(arrDapp.map((it) => it._id), null, moment().subtract(1, 'day').toDate());
      const arrViewAll: ArrViewType[] = await DappsInteractionWorker.getViewOfIdLocal(arrDapp.map((it) => it._id), null);

      const arrViewOfPinned: ArrViewType[] = await DappsInteractionWorker.getViewOfIdLocal(pinnedDapps.map((it) => it._id));

      // migrate view to dapps
      const arrDappTrending: DappsType[] = DappWorker.migrateViewToArrDappLocal(arrDapp, arrViewTrending).sort((a, b) => b.view - a.view).slice((parseInt(page) - 1) * parseInt(size), parseInt(page) * parseInt(size));

      // migrate view all top trending dapp
      const arrDappsTrendingAllTimeView: DappsType[] = DappWorker.migrateViewToArrDappLocal(arrDappTrending, arrViewAll);

      // sort view Data
      const arrDappPopular: DappsType[] = DappWorker.migrateViewToArrDappLocal(arrDapp, arrViewAll).sort((a, b) => b.view - a.view).slice((parseInt(page) - 1) * parseInt(size), parseInt(page) * parseInt(size));

      const formatViewPinned: DappsType[] = DappWorker.migrateViewToArrDappLocal(pinnedDapps, arrViewOfPinned);

      return { trendingDapps: arrDappsTrendingAllTimeView, popularDapps: arrDappPopular, pinnedDapps: formatViewPinned };
    });
  }

  static migrateViewToArrDappLocal(arrDapp: DappsType[], arrView: ArrViewType[]): DappsType[] {
    const formatViewPinned: DappsType[] = arrDapp.map((it) => {
      delete it.view;
      const foundView: ArrViewType = arrView.find((view) => view._id === it._id.toString());
      return { view: foundView ? foundView.view : 0, ...it };
    });

    return formatViewPinned;
  }

  static async getDappsOfgenreLocal(genre: string, chain: string, size: any = 15, ninSlug: string[]): Promise<DappsType[]> {
    const matchState: MatchStateType = {};

    if (getLength(chain) > 0) {
      matchState.chain = chain;
    }
    if (getLength(genre) > 0) {
      matchState.genre = genre;
    }
    if (getLength(ninSlug) > 0) {
      matchState.slug = { $nin: ninSlug };
    }
    const payload: DappsType[] = await Dapps.find(matchState, dappFilter).sort({ weight: -1 }).limit(parseInt(size)).lean();

    const arrView: ArrViewType[] = await DappsInteractionWorker.getViewOfIdLocal(payload.map((it) => it._id));

    return payload.map((it) => {
      const foundView: ArrViewType = arrView.find((view) => view._id === it._id.toString());
      return { view: foundView ? foundView.view : 0, ...it };
    });
  }

  static async getRecomendDapps(req: RequestCustom, res: Response, next: NextFunction) {
    const { page = 1, size = 10, chain } = req.query;
    const { user } = req;
    const dappMatchState: MatchStateType = {
      isActive: true,
    };
    const key: string = `DAPP_BROWER_HOME_ADDITIONAL_${1}_${15}_${chain}`;

    const storeData: any = await getStorage(key);

    const arrSideDapps: any[] = (storeData && storeData.data) ? [].concat(storeData.data.trendingDapps, storeData.data.popularDapps, storeData.data.pinnedDapps) : [];

    const arrNotRecommend: string[] = arrSideDapps.map((it) => it.slug);

    if (getLength(chain) > 0) {
      dappMatchState.chain = chain;
    }
    const payloadInteraction: { _id: string, totalView: number }[] = await DappsInteractionWorker.getUserDappsLocal(user);

    dappMatchState.slug = { $nin: arrNotRecommend };

    const arrDappsFilter: DappsType[] = await Dapps.find({ _id: { $in: payloadInteraction.map((it) => it._id) }, ...dappMatchState }).lean();
    const isMissingData: boolean = getLength(arrDappsFilter) < parseInt(page) * parseInt(size);
    const arrSlug: ObjectId[] = arrDappsFilter.map((it) => it._id);

    if (isMissingData) {
      const missingSize: any = parseInt(page) * parseInt(size) - getLength(arrSlug);
      if (missingSize >= parseInt(size)) {
        const payloadDapps: DappsType[] = await Dapps.find({ _id: { $nin: arrSlug }, ...dappMatchState }, dappFilter).sort({ weight: -1 }).skip(missingSize - parseInt(size)).limit(parseInt(size))
          .lean();
        const arrview: ArrViewType[] = await DappsInteractionWorker.getViewOfIdLocal(payloadDapps.map((it) => it._id));
        req.response = DappWorker.migrateViewToArrDappLocal(payloadDapps, arrview);
        return next();
      }
      const payloadDapps: DappsType[] = await Dapps.find({ _id: { $nin: arrSlug }, ...dappMatchState }, dappFilter).sort({ weight: -1 }).limit(parseInt(missingSize)).lean();
      const finalDapp: DappsType[] = arrDappsFilter.slice((parseInt(page) - 1) * parseInt(size), parseInt(page) * parseInt(size)).concat(payloadDapps);
      const arrview: ArrViewType[] = await DappsInteractionWorker.getViewOfIdLocal(finalDapp.map((it) => it._id));
      req.response = DappWorker.migrateViewToArrDappLocal(finalDapp, arrview);
      return next();
    }
    const payloadDappsView: DappsType[] = arrDappsFilter.slice((parseInt(page) - 1) * parseInt(size), parseInt(page) * parseInt(size));
    const arrview: ArrViewType[] = await DappsInteractionWorker.getViewOfIdLocal(payloadDappsView.map((it) => it._id));
    req.response = DappWorker.migrateViewToArrDappLocal(payloadDappsView, arrview);
    return next();
  }

  static async getSuggestBySlug(req: RequestCustom, res: Response, next: NextFunction) {
    const findDapp: DappsType = await Dapps.findOne({ slug: req.params.slug }, { genre: 1, chain: 1 }).lean();
    if (!findDapp) return next();

    const totalSuggestDapp: number = await Dapps.countDocuments({
      slug: { $ne: req.params.slug },
      $or: [{ genre: { $in: findDapp.genre } }, { chain: findDapp.chain }],
    });
    req.response = await Dapps.findOne(
      {
        slug: { $ne: req.params.slug },
        $or: [{ genre: { $in: findDapp.genre } }, { chain: findDapp.chain }],
      },
      dappFilter,
    ).skip(Math.floor(random(totalSuggestDapp)));

    return next();
  }

  static async getBySlug(req: RequestCustom, res: Response, next: NextFunction) {
    const findDapp: DappsType = await Dapps.findOne({ slug: req.params.slug }, dappFilter).lean();

    if (!findDapp) return next();

    const dappsCategory: GenreType[] = await Genre.find({ _id: { $in: findDapp.genre } }, { slug: 1, title: 1 });

    DappsInteractionWorker.addViewWithUserLocal(findDapp.slug, req.user);
    delete findDapp._id;

    const finalDappData: DappsType = Object.assign(findDapp, { genre: dappsCategory });
    req.response = finalDappData;
    return next();
  }

  static async getFilterDapps(req: RequestCustom, res: Response, next: NextFunction) {
    const {
      isPinned, page = 1, size = 5, chain, category, keyword,
    } = req.query;

    const findState: MatchStateType = { isActive: true };

    if (getLength(category) > 0) {
      const filterSlug: string[] = category.split(',');
      const findGenre: GenreType[] = await Genre.find({ slug: { $in: filterSlug } }, { _id: 1 });

      if (getLength(findGenre) === 0) {
        req.response = [];
        return next();
      }
      findState.genre = { $in: findGenre.map((it) => it._id.toString()) };
    }

    if (getLength(chain) > 0) {
      findState.chain = chain;
    }

    if (isPinned === 'true') {
      findState.isPinned = true;
    }

    if (getLength(keyword)) {
      findState.title = { $regex: keyword, $options: 'i' };
    }

    const payload: DappsType[] = await Dapps.find(findState, dappFilter).sort({ weight: -1, _id: 1 }).skip(genSkipNum(page, size)).limit(parseInt(size))
      .lean();
    const arrview: { _id: string, view: number}[] = await DappsInteractionWorker.getViewOfIdLocal(payload.map((it) => it._id));
    req.response = DappWorker.migrateViewToArrDappLocal(payload, arrview);
    return next();
  }

  static async getFilterTopViewDapp(req: RequestCustom, res: Response, next: NextFunction) {
    const {
      isPinned, page = 1, size = 5, chain, category, keyword,
    } = req.query;

    const findState: MatchStateType = { isActive: true };

    if (getLength(category) > 0) {
      const filterSlug: string[] = category.split(',');
      const findGenre: GenreType[] = await Genre.find({ slug: { $in: filterSlug } }, { _id: 1 });
      if (getLength(findGenre) === 0) {
        req.response = [];
        return next();
      }
      findState.genre = { $in: findGenre.map((it) => it._id.toString()) };
    }

    if (getLength(chain) > 0) {
      findState.chain = chain;
    }

    if (isPinned === 'true') {
      findState.isPinned = true;
    }

    if (getLength(keyword)) {
      findState.title = { $regex: keyword, $options: 'i' };
    }

    const payload: DappsType[] = await Dapps.find(findState, dappFilter).lean();
    const arrview: ArrViewType[] = await DappsInteractionWorker.getViewOfIdLocal(payload.map((it) => it._id));
    req.response = DappWorker.migrateViewToArrDappLocal(payload, arrview).sort((a, b) => b.view - a.view).slice(genSkipNum(page, size), parseInt(page) * parseInt(size));
    return next();
  }

  static async getHomeByChain(req: RequestCustom, res: Response, next: NextFunction) {
    const { chain } = req.params;

    const page = 1;
    const size = 10;
    // DappsInteractionWorker.addViewWithUserLocal('homeView', '')

    const key: string = `DAPP_HOME_BY_CHAIN_${chain}`;
    fetchCacheRedis(key, req, next, 5 * 60 * 1000, async () => {
      const totalGenre: DappsType[] = await Dapps.aggregate([
        {
          $match: {
            chain,
            $or: [{ source: '' }, { source: { $exists: false } }],
          },
        },
        {
          $group: {
            _id: '$genre',
          },
        },
      ]);

      const mapGenre: string[] = ([].concat.apply([], totalGenre.map((gr) => gr._id))).filter(onlyUnique);
      const findGenre: GenreType[] = await Genre.find({ _id: { $in: mapGenre }, isActive: true }, { _id: 1, slug: 1, title: 1 }).sort({ weight: -1 }).lean();
      const finalData: { genre: GenreType, dapps: DappsType[] }[] = await Promise.all(findGenre.map(async (it) => {
        const dappData: DappsType[] = await DappWorker.getTopViewDappOfGenreLocal(it._id.toString(), chain, page, size);
        return {
          genre: it,
          dapps: dappData,
        };
      }));
      return finalData;
    });
  }

  static async getFilterTopviewByCategory(req: RequestCustom, res: Response, next: NextFunction) {
    const {
      page = 1, size = 5, category, chain,
    } = req.query;

    const filterSlug: string[] = category.split(',');
    const findGenre: GenreType[] = await Genre.find({ slug: { $in: filterSlug }, isActive: true }, { _id: 1, slug: 1, title: 1 }).lean();
    if (getLength(findGenre) === 0) {
      req.response = [];
      return next();
    }

    const finalData: { genre: GenreType, dapps: DappsType[] }[] = await Promise.all(findGenre.map(async (it) => {
      const dappData: DappsType[] = await DappWorker.getTopViewDappOfGenreLocal(it._id.toString(), chain, page, size);
      return {
        genre: it,
        dapps: dappData,
      };
    }));

    req.response = finalData;
    return next();
  }

  static async getTopViewDappOfGenreLocal(genreId: string, chain: string, page: any = 1, size: any = 10): Promise<DappsType[]> {
    const dappMatchState: MatchStateType = { genre: genreId };
    if (getLength(chain) > 0) {
      dappMatchState.chain = chain;
    }
    const dappsPayload: DappsType[] = await Dapps.find(dappMatchState, dappFilter).lean();
    const arrView: ArrViewType[] = await DappsInteractionWorker.getViewOfIdLocal(dappsPayload.map((it) => it._id));

    const finalData: DappsType[] = DappWorker.migrateViewToArrDappLocal(dappsPayload, arrView).sort((a, b) => b.view - a.view).slice(genSkipNum(page, size), parseInt(page) * parseInt(size));

    return finalData;
  }

  static async getDappsByIdLocal(slug: string): Promise<DappsType | false> {
    try {
      const payload: DappsType = await Dapps.findOne({ slug, isActive: true }, dappFilter);
      return payload;
    } catch (err) {
      return false;
    }
  }

  // Admin Data
  static async putPin(req: RequestCustom, res: Response, next: NextFunction) {
    const findData: any = await Dapps.findOne({ _id: req.params.id }, { isPinned: 1 });
    if (!findData) return next();
    await findData.updateOne({ isPinned: !findData.isPinned });
    req.response = true;
    return next();
  }

  static async getAdmin(req: RequestCustom, res: Response, next: NextFunction) {
    const {
      genre, isPinned, status, page, size, chain,
    } = req.query;

    const findState: MatchStateType = { isActive: status === 'true' };

    if (genre) {
      const findGenre: GenreType = await Genre.findOne({ slug: genre }, { _id: 1 });
      if (!findGenre) return next();
      findState.genre = findGenre._id;
    }

    if (chain) {
      findState.chain = chain;
    }

    if (isPinned === 'true') {
      findState.isPinned = true;
    }

    const payload: DappsType[] = await Dapps.find(findState, dappFilter).sort({ weight: -1 }).skip(genSkipNum(page, size)).limit(parseInt(size));
    req.response = payload;
    return next();
  }

  static async postDapps(req: RequestCustom, res: Response, next: NextFunction) {
    const {
      title, description, descriptionMobile, logo, banner = [], url, genre, chain, weight = 0, tags = [], bannerMobile, social,
    } = req.body;

    if (getLength(title === 0) || getLength(logo === 0)) {
      req.response = { errMess: 'titleNull' };
      return next();
    }
    if ((await Dapps.countDocuments({ slug: createSlug(title) })) > 0) {
      req.response = { errMess: 'titleExists' };
      return next();
    }
    if ((await Genre.countDocuments({ _id: { $in: genre } })) === 0) {
      req.response = { errMess: 'genreNull' };
      return next();
    }

    await Dapps.create({
      slug: createSlug(title),
      title,
      descriptionMobile,
      description,
      logo,
      banner,
      url,
      genre,
      chain,
      weight,
      tags,
      bannerMobile: bannerMobile || banner[0],
      social,
    });

    req.response = true;
    next();
  }

  static async putDapps(req: RequestCustom, res: Response, next: NextFunction) {
    const findData = await Dapps.findOne({ _id: req.body.id }, { _id: 1 });
    if (!findData) return next();

    const stateUpdate: any = genUpdate(req.body, ['title', 'descriptionMobile', 'description', 'logo', 'url', 'genre', 'chain', 'banner', 'weight', 'tags', 'bannerMobile', 'social']);

    if (stateUpdate.title) {
      stateUpdate.slug = createSlug(stateUpdate.title);
    }
    if (stateUpdate.genre) {
      if ((await Genre.countDocuments({ _id: stateUpdate.genre })) === 0) return next();
    }

    await findData.updateOne(stateUpdate);
    req.response = true;
    return next();
  }

  static async deleteDapps(req, res, next) {
    const findGenre: any = await Dapps.findOne({ _id: req.params.id }, { isActive: 1, _id: 1 });
    if (!findGenre) return next();

    await findGenre.updateOne({ isActive: !findGenre.isActive, slug: `DELETE_DAPP_${Date.now()}` });
    req.response = true;
    return next();
  }

  // Interaction Report
  static async getInteractionReport(req: RequestCustom, res: Response, next: NextFunction) {
    const pinnedDapps: DappsType[] = await Dapps.find({ isPinned: true }, { _id: 1 });

    const allViewCount: { _id: null, totalView: number }[] = await DappInteraction.aggregate([
      {
        $match: {
          type: dappsInteractionType.dapps,
          isActive: true,
        },
      },
      {
        $group: {
          _id: null,
          totalView: { $sum: { $first: '$relatedID' } },
        },
      },
    ]);

    const allViewAndOpenDapps: { _id: string, total: number }[] = await DappInteraction.aggregate([
      {
        $match: {
          id: { $in: pinnedDapps.map((it) => it._id.toString()) },
          isActive: true,
        },
      },
      {
        $group: {
          _id: '$type',
          total: { $sum: { $first: '$relatedID' } },
        },
      },
    ]);

    const totalView: number = allViewCount[0] ? allViewCount[0].totalView : 0;
    const totalOpenData: { _id: string, total: number } = allViewAndOpenDapps.find((it) => it._id === dappsInteractionType.openDapp);
    const totalViewData: { _id: string, total: number } = allViewAndOpenDapps.find((it) => it._id === dappsInteractionType.dapps);

    req.response = {
      totalViewAll: totalView,
      totalFeaturedOpen: totalOpenData ? totalOpenData.total : 0,
      totalFeaturedView: totalViewData ? totalViewData.total : 0,
    };
    next();
  }
}
