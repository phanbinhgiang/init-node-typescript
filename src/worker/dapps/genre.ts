/* eslint-disable no-underscore-dangle */
/* eslint-disable max-len */
import { NextFunction, Response } from 'express';
import {
  createSlug, fetchCacheRedisLocal, genUpdate, getLength,
} from '../function';
import Genre from '../../model/dapps/Genre';
import Dapps from '../../model/dapps/Dapps';
import { RequestCustom } from '../../middleware/constants';
import { GenreType } from '../../service/addaps/constants';

export default class GenreWorker {
  static async getGenre(req: RequestCustom, res: Response, next: NextFunction) {
    const payload = await fetchCacheRedisLocal('GENRE_DAPPS', 120000, async () => {
      const response: GenreType[] = await Genre.find({ isActive: true, $or: [{ source: '' }, { source: { $exists: false } }] }, {
        slug: 1, title: 1, logo: 1, _id: 0, description: 1,
      }).sort({ weight: -1 });
      return response;
    });
    req.response = payload;
    return next();
  }

  static async getAdmin(req: RequestCustom, res: Response, next: NextFunction) {
    const { page = 1, size = 100 } = req.query;
    const payload: GenreType[] = await Genre.find({ isActive: true }).sort({ createdAt: -1 }).skip((parseInt(page) - 1) * parseInt(size)).limit(parseInt(size));
    req.response = payload;
    next();
  }

  static async getGenreBySlug(req: RequestCustom, res: Response, next: NextFunction) {
    const slug: string = req.params.id;

    const payload: GenreType = await Genre.findOne({ isActive: true, slug }, {
      slug: 1, title: 1, logo: 1, _id: 1, description: 1, banner: 1,
    }).lean();
    const totalDapps: number = await Dapps.countDocuments({ isActive: true, genre: payload._id.toString() });
    req.response = { totalDapps, ...payload };

    next();
  }

  static async putPin(req: RequestCustom, res: Response, next: NextFunction) {
    const findGenre: GenreType = await Genre.findOne({ _id: req.params.id }, { isPinned: 1 });
    if (!findGenre) return next();
    await Genre.updateOne({ isPinned: !findGenre.isPinned });
    req.response = true;
    return next();
  }

  static async postGenre(req: RequestCustom, res: Response, next: NextFunction) {
    const {
      title, description, logo, banner = [], weight = 0, tags = [],
    } = req.body;

    if (getLength(title === 0) || getLength(logo === 0)) return next();
    if ((await Genre.countDocuments({ slug: createSlug(title) })) > 0) return next();

    await Genre.create({
      slug: createSlug(title),
      title,
      description,
      logo,
      banner,
      createdUser: req.user,
      isPinned: false,
      weight,
      tags,
    });
    req.response = true;
    return next();
  }

  static async putGenre(req: RequestCustom, res: Response, next: NextFunction) {
    const findGenre: GenreType = await Genre.findOne({ _id: req.body.id });
    if (!findGenre) return next();

    const stateUpdate: any = genUpdate(req.body, ['title', 'description', 'logo', 'banner', 'weight', 'tags']);
    if (stateUpdate.title) {
      stateUpdate.slug = createSlug(stateUpdate.title);
    }

    await Genre.updateOne({ _id: req.body.id }, stateUpdate);
    req.response = true;
    return next();
  }

  static async deleteGenre(req: RequestCustom, res: Response, next: NextFunction) {
    const findGenre: GenreType = await Genre.findOne({ _id: req.params.id }, { isActive: 1, _id: 1 });
    if (!findGenre) return next();

    await Genre.updateOne({ _id: req.params.id }, { isActive: !findGenre.isActive, slug: `DELETE-GENRE-${Date.now()}` });

    req.response = true;
    return next();
  }
}
