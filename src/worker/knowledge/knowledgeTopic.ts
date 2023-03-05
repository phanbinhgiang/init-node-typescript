/* eslint-disable no-return-await */
/* eslint-disable no-underscore-dangle */
/* eslint-disable consistent-return */
/* eslint-disable max-len */
import { Response, NextFunction } from 'express';
import KnowledgeTopic from '../../model/knowledge/KnowledgeTopic';
import {
  createSlug, genUpdate, getLength, genSkipNum,
} from '../function';
import KnowledgeContentWorker from './knowledgeContent';
import User from '../../model/user/User';
import UserWorker from '../system/user';
import {
  KnowledgeTopicType, MatchStateType, UserType, userFilter,
} from '../../service/knowledge/constants';
import { convertToMongoID } from '../../common/function';
import { genSortStateMongo } from '../../service/functions';
import { RequestCustom } from '../../middleware/constants';

export default class KnowledgeTopicWorker {
  static async getAdminTopic(req: RequestCustom, res: Response, next: NextFunction) {
    const {
      keyword, page = 1, size = 10, from = 0, to = Date.now(),
    } = req.query;
    const matchState: MatchStateType = {
      createdAt: {
        $gte: new Date(parseInt(from)),
        $lte: new Date(parseInt(to)),
      },
    };

    if (getLength(keyword) > 0) {
      matchState.title = { $regex: `.*${keyword}.*`, $options: 'i' };
    }

    const payload: KnowledgeTopicType[] = await KnowledgeTopic.find(matchState).sort({ createdAt: 1 }).skip(genSkipNum(page, size)).limit(parseInt(size))
      .lean();
    const arrAuthorData: UserType[] = await UserWorker.getByListLocal(payload.map((it: any) => it.author), userFilter);
    const total: number = await KnowledgeTopic.countDocuments(matchState);
    const formatTopic: KnowledgeTopicType[] = await KnowledgeTopicWorker.formatTopicDataLocal(payload);
    req.response = {
      data: KnowledgeTopicWorker.migrateAuthorToTopicLocal(formatTopic, arrAuthorData),
      total,
      totalPage: Math.ceil(total / parseInt(size)),
      currPage: parseInt(page),
    };

    next();
  }

  static async getFilterTopic(req: RequestCustom, res: Response, next: NextFunction) {
    const {
      keyword, page = 1, size = 10, sort = '-createdAt',
    } = req.query;
    const matchState: MatchStateType = {
      isActive: true,
    };

    if (getLength(keyword) > 0) {
      matchState.title = { $regex: `.*${keyword}.*`, $options: 'i' };
    }

    const payload: KnowledgeTopicType[] = await KnowledgeTopic.find(matchState, { isActive: 0, createdAt: 0, updatedAt: 0 }).sort(genSortStateMongo(sort)).skip(genSkipNum(page, size)).limit(parseInt(size))
      .lean();
    const total: number = await KnowledgeTopic.countDocuments(matchState);
    const formatTopic: KnowledgeTopicType[] = await KnowledgeTopicWorker.formatTopicDataLocal(payload);

    req.response = {
      data: formatTopic,
      total,
      totalPage: Math.ceil(total / parseInt(size)),
      currPage: parseInt(page),
    };

    next();
  }

  // Landing API
  static async getTopicDetailHomeById(req: RequestCustom, res: Response, next: NextFunction) {
    const { id } = req.params;

    const topicPayload: KnowledgeTopicType = await KnowledgeTopic.findOne({ id }).lean();

    if (!topicPayload) {
      req.response = { errMess: 'idNotFound' };
      return next();
    }

    const formatCategory: { totalArticle: number, _id: any, title: string }[] = await KnowledgeTopicWorker.formatCategoryLocal(topicPayload._id, topicPayload.category);

    const arrAuthor: any[] = await KnowledgeContentWorker.getAuthorOfTopicLocal(topicPayload._id);

    const authorData: UserType[] = await User.find({ id: { $in: arrAuthor.map((it) => it._id) } }, {
      _id: 0, name: 1, userName: 1, image: 1,
    });

    req.response = { ...topicPayload, authors: authorData, category: formatCategory };
    next();
  }

  // Local Funtions
  static async formatCategoryLocal(topicId: string, arrCategory: { _id: any, title: string}[]): Promise<{ totalArticle: number, _id: any, title: string }[]> {
    return await Promise.all(arrCategory.map(async (it) => {
      const totalArticle:number = await KnowledgeContentWorker.countTotalArticleByTopicCategoryIdLocal(topicId, it._id);
      return { ...it, totalArticle };
    }));
  }

  static async formatTopicDataLocal(arrTopic: KnowledgeTopicType[]): Promise<KnowledgeTopicType[]> {
    return await Promise.all(arrTopic.map(async (it) => {
      const totalArticle: number = await KnowledgeContentWorker.countTotalArticleByTopicIdLocal(it._id);
      return { ...it, totalArticle };
    }));
  }

  static migrateAuthorToTopicLocal(arrTopic: KnowledgeTopicType[], arrAuthor: UserType[]): KnowledgeTopicType[] {
    return arrTopic.map((it) => {
      const foundAuthor: UserType = arrAuthor.find((usr) => usr.id === it.author);
      return Object.assign(it, { author: foundAuthor || { id: it.author } });
    });
  }

  // AdminAPI
  static async getDetailById(req: RequestCustom, res: Response, next: NextFunction) {
    const { id } = req.params;
    const payload: KnowledgeTopicType = await KnowledgeTopic.findOne({ _id: id });
    req.response = payload;
    return next();
  }

  static async getAllTopicAdmin(req: RequestCustom, res: Response, next: NextFunction) {
    const payload: KnowledgeTopicType[] = await KnowledgeTopic.find({ isActive: true }, { title: 1, image: 1, category: 1 }).lean();
    req.response = payload;
    next();
  }

  static async create(req: RequestCustom, res: Response, next: NextFunction) {
    const {
      title, author, description, isActive, image, category,
    } = req.body;

    const id: string = createSlug(title);

    const countExists: number = await KnowledgeTopic.countDocuments({ id });

    if (countExists > 0) {
      req.response = { errMess: 'titleExists' };
      return next();
    }

    const payload: KnowledgeTopicType = await KnowledgeTopic.create({
      id, title, author, description, isActive, image, category,
    });
    req.response = payload;
    next();
  }

  static async update(req: RequestCustom, res: Response, next: NextFunction) {
    const { id } = req.body;

    const updateFiled: any = genUpdate(req.body, ['title', 'author', 'description', 'isActive', 'image', 'category']);

    if (updateFiled.title) {
      const genId: string = createSlug(updateFiled.title);

      const countExists: number = await KnowledgeTopic.countDocuments({ id: genId });

      if (countExists > 0) {
        req.response = { errMess: 'titleExists' };
        return next();
      }

      updateFiled.id = genId;
    }

    KnowledgeTopic.findOneAndUpdate({ _id: id }, updateFiled, { new: true }, (err, result) => {
      if (!err && result) {
        req.response = true;
        next();
      } else {
        req.response = false;
        req.success = false;
        next();
      }
    });
  }

  static async delete(req: RequestCustom, res: Response, next: NextFunction) {
    const { id } = req.query;

    const countExists: number = await KnowledgeTopic.countDocuments({ _id: id });

    if (countExists === 0) {
      req.response = { errMess: 'idNotFound' };
      return next();
    }

    await KnowledgeTopic.deleteOne({ _id: id });
    await KnowledgeContentWorker.updateArticleTopic(id, '');
    req.response = true;
    next();
  }

  //* Local fuctions for Other Worker
  static async getTopicDetailbyIdLocal(topicId: string): Promise<KnowledgeTopicType> {
    return await KnowledgeTopic.findOne({ $or: [{ id: topicId }, { _id: convertToMongoID(topicId) }] });
  }

  static async getListTopicDetailbyIdLocal(arrId: object[]): Promise<KnowledgeTopicType[]> {
    return await KnowledgeTopic.find({ $or: [{ id: { $in: arrId } }, { _id: { $in: arrId } }] });
  }
}
