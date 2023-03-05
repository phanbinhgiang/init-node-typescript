/* eslint-disable max-len */
/* eslint-disable no-return-await */
/* eslint-disable no-underscore-dangle */
/* eslint-disable consistent-return */
import get from 'lodash/get';
import { NextFunction, Response } from 'express';
import KnowledgeContent from '../../model/knowledge/KnowledgeContent';

import {
  createSlug, genSkipNum, genUpdate, getLength,
} from '../function';
import {
  knowledgeContentType, KnowledgeContentType, MatchStateType,
  UserType,
  KnowledgeTopicType,
  InteractionType,
} from '../../service/knowledge/constants';
import { genSortStateMongo } from '../../service/functions';
import KnowledgeTopicWorker from './knowledgeTopic';

import KnowledgeWorker from './index';
import UserWorker from '../system/user';
import KnowledgeCommentWorker from './knowledgeComment';
import { convertToMongoID } from '../../common/function';
import { RequestCustom } from '../../middleware/constants';

const articleFilter = {
  author: 1, title: 1, description: 1, content: 1, createdAt: 1, updatedAt: 1, _id: 1, id: 1, topic: 1,
};

export default class KnowledgeContentWorker {
  //* Admin Section
  static async getAdmin(req: RequestCustom, res: Response, next: NextFunction) {
    const {
      keyword, page = 1, size = 10, type = knowledgeContentType.article, topic, from = 0, to = Date.now(),
    } = req.query;
    const matchState: MatchStateType = {
      type,
      createdAt: {
        $gte: new Date(parseInt(from)),
        $lte: new Date(parseInt(to)),
      },
    };
    if (getLength(keyword) > 0) {
      matchState.title = { $regex: `.*${keyword}.*`, $options: 'i' };
    }

    if (getLength(topic) > 0) {
      matchState.topic = topic;
    }

    const payload: KnowledgeContentType<string>[] = await KnowledgeContent.find(matchState).sort({ createdAt: 1 }).skip(genSkipNum(page, size)).limit(parseInt(size))
      .lean();
    const arrAuthor: UserType[] = await UserWorker.getByListLocal(payload.map((it) => it.author), {
      userName: 1, name: 1, userNameProfile: 1, image: 1, id: 1, _id: 0,
    });
    const arrTopic: KnowledgeTopicType[] = await KnowledgeTopicWorker.getListTopicDetailbyIdLocal(payload.map((it) => convertToMongoID(it.topic)));
    console.log('🚀 ~ file: knowledgeContent.js:36 ~ KnowledgeContentWorker ~ getAdmin ~ arrTopic', arrTopic);
    const total: number = await KnowledgeContent.countDocuments(matchState);

    req.response = {
      data: KnowledgeContentWorker.migrateAuthorToDataLocal(payload, arrAuthor, arrTopic),
      total,
      totalPage: Math.ceil(total / parseInt(size)),
      currPage: parseInt(page),
    };

    next();
  }

  static async getContentDetailByIdAdmin(req: RequestCustom, res: Response, next: NextFunction) {
    const { id } = req.params;
    const payload: KnowledgeContentType<string> = await KnowledgeContent.findOne({ _id: id });
    req.response = payload;
    next();
  }

  static async create(req: RequestCustom, res: Response, next: NextFunction) {
    const {
      title, author, content, topic, category, type, description, isActive,
    } = req.body;

    const id: string = createSlug(title);

    const countExists: number = await KnowledgeContent.countDocuments({ id, type });

    if (countExists > 0) {
      req.response = { errMess: 'titleExists' };
      return next();
    }

    const payload: KnowledgeContentType<string> = await KnowledgeContent.create({
      id, title, author, content, category, topic, type, description, isActive,
    });
    req.response = payload;
    next();
  }

  static async update(req: RequestCustom, res: Response, next: NextFunction) {
    const { id } = req.body;

    const updateFiled: any = genUpdate(req.body, ['title', 'author', 'content', 'category', 'topic', 'description', 'isActive']);

    if (updateFiled.title) {
      const genId: string = createSlug(updateFiled.title);

      const countExists: number = await KnowledgeContent.countDocuments({ id: genId });

      if (countExists > 0) {
        req.response = { errMess: 'titleExists' };
        return next();
      }

      updateFiled.id = genId;
    }

    KnowledgeContent.findOneAndUpdate({ _id: id }, updateFiled, { new: true }, (err, result) => {
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
    const { id, type } = req.query;

    if (getLength(type) === 0 || type === knowledgeContentType.question) {
      req.response = { errMess: 'invalidType' };
      return next();
    }

    const countExists: number = await KnowledgeContent.countDocuments({ _id: id, type });

    if (countExists === 0) {
      req.response = { errMess: 'idNotFound' };
      return next();
    }

    await KnowledgeContent.deleteOne({ _id: id, type });
    req.response = true;
    next();
  }

  // Loal fuction
  static migrateAuthorToDataLocal(arrData: any, arrAuthor: UserType[], arrTopic: KnowledgeTopicType[]): any[] {
    return arrData.map((it) => {
      const foundAuthor: UserType = arrAuthor.find((usr) => usr.id === it.author);
      const foundTopic: KnowledgeTopicType = arrTopic.find((tp) => tp._id.toString() === it.topic);

      return Object.assign(it, { author: foundAuthor || { id: it.author }, topic: foundTopic ? foundTopic.title : '' });
    });
  }

  static async updateArticleTopic(oldTopic: any, newTopic: string) {
    await KnowledgeContent.updateMany({ type: knowledgeContentType.article, topic: oldTopic.toString() }, { topic: newTopic });
  }

  //* User Sections
  static async getfilterContent(req: RequestCustom, res: Response, next: NextFunction) {
    const {
      page = 1, size = 10, keyword, type = knowledgeContentType.article, topic, category, sort = 'createdAt',
    } = req.query;
    const matchState: MatchStateType = {
      type,
      isActive: true,
    };

    if (getLength(topic) > 0) {
      const topicPayload = await KnowledgeTopicWorker.getTopicDetailbyIdLocal(topic);
      if (topicPayload) {
        matchState.topic = topicPayload._id.toString();
      }
    }

    if (getLength(category) > 0) {
      matchState.category = category;
    }

    if (getLength(keyword) > 0) {
      matchState.title = { $regex: `.*${keyword}.*`, $options: 'i' };
    }

    const payload: KnowledgeContentType<string>[] = await KnowledgeContent.find(matchState, articleFilter).sort(genSortStateMongo(sort)).skip(genSkipNum(page, size)).limit(parseInt(size))
      .lean();
    const total: number = await KnowledgeContent.countDocuments(matchState);

    const formatPayload: KnowledgeContentType<UserType>[] = await Promise.all(payload.map(async (it) => {
      const authorData: UserType = await UserWorker.getByIdLocal(it.author, {
        userName: 1, name: 1, userNameProfile: 1, image: 1, _id: 0,
      });
      return Object.assign(it, { author: authorData });
    }));

    req.response = {
      data: formatPayload, total, totalPage: Math.ceil(total / parseInt(size)), currPage: parseInt(page),
    };
    next();
  }

  static async getDetailContentById(req: RequestCustom, res: Response, next: NextFunction) {
    const { id, type } = req.params;

    if (getLength(id) === 0 || getLength(type) === 0) {
      req.response = { errMess: 'missingParams' };
      next();
    }
    const payload: KnowledgeContentType<string> = await KnowledgeContent.findOne({ id, type }, articleFilter).lean();

    if (!payload) {
      req.response = { errMess: 'idNotfound' };
      next();
    }

    const topicData: KnowledgeTopicType = await KnowledgeTopicWorker.getTopicDetailbyIdLocal(payload.topic);

    const author: UserType = await UserWorker.getByIdLocal(payload.author, {
      userName: 1, name: 1, userNameProfile: 1, image: 1, _id: 0,
    });

    req.response = Object.assign(payload, { author, topic: topicData.title });
    next();
  }

  //* Question
  static async formatQuestionLocal(payload: KnowledgeContentType<string>[]) : Promise<KnowledgeContentType<UserType>[]> {
    return await Promise.all(payload.map(async (it) => {
      const authorData: UserType = await UserWorker.getByIdLocal(it.author, {
        userName: 1, name: 1, userNameProfile: 1, image: 1, _id: 0,
      });
      const interaction: {
        totalVote: number;
        totalBookmark: number;
        totalView: number;
    } = await KnowledgeWorker.getInteractionOfQuestionLocal(it._id);
      const totalComment: number = await KnowledgeCommentWorker.getTotalCommentOfQuestionLocal(it._id);
      return Object.assign(it, { author: authorData, totalComment }, interaction);
    }));
  }

  static async getListQuestion(req: RequestCustom, res: Response, next: NextFunction) {
    const {
      keyword, page = 1, size = 10, sort = '-createdAt',
    } = req.query;
    const userId: string = req.user;
    const matchState: MatchStateType = {
      type: knowledgeContentType.question,
    };

    if (getLength(keyword) > 0) {
      matchState.title = { $regex: `.*${keyword}.*`, $options: 'i' };
    }

    let payload: KnowledgeContentType<string>[] = [];
    let formatPayload: KnowledgeContentType<UserType>[] = [];
    let total: number = 0;

    switch (sort) {
      case 'trending': {
        payload = await KnowledgeContent.find(matchState, '_id').lean();
        const listID: string[] = payload.map((item) => item._id.toString());
        const vote: any[] = await KnowledgeWorker.getInteractionVoteLocal(listID);
        const dataFilter: string[] = (listID.map((item) => {
          const topVote: any = vote.find((index) => index._id === item);
          return { _id: item, votes: get(topVote, 'count', 0) };
        }).sort((a, b) => b.votes - a.votes)).slice(genSkipNum(page, size), page * size).map((item) => item._id);
        payload = await KnowledgeContent.find({ _id: { $in: dataFilter } }, articleFilter).lean();
        total = await KnowledgeContent.countDocuments(matchState);
        formatPayload = (await KnowledgeContentWorker.formatQuestionLocal(payload)).sort((a, b) => b.totalVote - a.totalVote);
        break;
      }

      case 'topView': {
        payload = await KnowledgeContent.find(matchState, '_id').lean();
        const listID: string[] = payload.map((item) => item._id.toString());
        const view: any[] = await KnowledgeWorker.getInteractionViewLocal(listID);
        const dataFilter: string[] = (listID.map((item) => {
          const topView: any = view.find((index) => index._id === item);
          return { _id: item, views: get(topView, 'count', 0) };
        }).sort((a, b) => b.views - a.views)).slice(genSkipNum(page, size), page * size).map((item) => item._id);
        payload = await KnowledgeContent.find({ _id: { $in: dataFilter } }, articleFilter).lean();
        total = await KnowledgeContent.countDocuments(matchState);
        formatPayload = (await KnowledgeContentWorker.formatQuestionLocal(payload)).sort((a, b) => b.totalView - a.totalView);
        break;
      }

      case 'save': {
        const bookmark: InteractionType[] = await KnowledgeWorker.getInteractionBookmarkOfUserLocal(userId);
        const dataFilter: string[] = bookmark.map((item) => item.id);
        payload = await KnowledgeContent.find({ _id: { $in: dataFilter } }, articleFilter).sort(genSortStateMongo('')).skip(genSkipNum(page, size)).limit(parseInt(size))
          .lean();
        total = getLength(bookmark);
        formatPayload = await KnowledgeContentWorker.formatQuestionLocal(payload);
        break;
      }

      default:
        payload = await KnowledgeContent.find(matchState, articleFilter).sort(genSortStateMongo(sort)).skip(genSkipNum(page, size)).limit(parseInt(size))
          .lean();
        total = await KnowledgeContent.countDocuments(matchState);
        formatPayload = await KnowledgeContentWorker.formatQuestionLocal(payload);
        break;
    }
    req.response = {
      data: formatPayload, total, totalPage: Math.ceil(total / parseInt(size)), currPage: parseInt(page),
    };
    next();
  }

  static async getQuestionDetailById(req: RequestCustom, res: Response, next: NextFunction) {
    const { id } = req.params;
    const payload: KnowledgeContentType<string> = await KnowledgeContent.findOne({ id, type: knowledgeContentType.question }, { type: 0 }).lean();
    KnowledgeWorker.addInteractionDataLocal(payload._id);
    const authorData = await UserWorker.getByIdLocal(payload.author, {
      userName: 1, name: 1, userNameProfile: 1, image: 1, _id: 0, id: 1,
    });
    const interaction = await KnowledgeWorker.getInteractionOfQuestionLocal(payload._id);
    const totalComment = await KnowledgeCommentWorker.getTotalCommentOfQuestionLocal(payload._id);

    req.response = Object.assign(payload, { author: authorData, totalComment }, interaction);
    next();
  }

  static async createQuestion(req: RequestCustom, res: Response, next: NextFunction) {
    const {
      title, author, content, image,
    } = req.body;
    const id = createSlug(title);

    const countExists: number = await KnowledgeContent.countDocuments({ id, type: knowledgeContentType.question });

    if (countExists > 0) {
      req.response = { errMess: 'titleExists' };
      return next();
    }
    await KnowledgeContent.create({
      id, title, author, content, type: knowledgeContentType.question, image,
    });

    req.response = true;
    next();
  }

  static async updateQuestion(req: RequestCustom, res: Response, next: NextFunction) {
    const { id } = req.body;

    const updateFiled: any = genUpdate(req.body, ['title', 'author', 'content', 'image', 'isActive']);

    if (updateFiled.title) {
      const genId: string = createSlug(updateFiled.title);

      const countExists: number = await KnowledgeContent.countDocuments({ id: genId, type: knowledgeContentType.question });

      if (countExists > 0) {
        req.response = { errMess: 'titleExists' };
        return next();
      }

      updateFiled.id = genId;
    }

    KnowledgeContent.findOneAndUpdate({ _id: id }, updateFiled, { new: true }, (err, result) => {
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

  static async deleteQuestion(req: RequestCustom, res: Response, next: NextFunction) {
    const { id } = req.query;
    const { user } = req;
    const countExists: number = await KnowledgeContent.countDocuments({ _id: id, type: knowledgeContentType.question, author: user });

    if (countExists === 0) {
      req.response = { errMess: 'idNotFound' };
      return next();
    }

    await KnowledgeContent.deleteOne({ _id: id, type: knowledgeContentType.question });
    await KnowledgeCommentWorker.deleteCommentOfQuestionLocal(id);
    await KnowledgeWorker.clearInteractionOfQuestionLocal(id);

    req.response = true;
    next();
  }

  // Local
  static async countTotalArticleByTopicIdLocal(topicId: string): Promise<number> {
    return await KnowledgeContent.countDocuments({ isActive: true, topic: topicId, type: knowledgeContentType.article });
  }

  static async countTotalArticleByTopicCategoryIdLocal(topicId: string, categoryId: string): Promise<number> {
    return await KnowledgeContent.countDocuments({
      isActive: true, topic: topicId, category: categoryId, type: knowledgeContentType.article,
    });
  }

  static async getAuthorOfTopicLocal(topicId: any): Promise<any[]> {
    const payload = KnowledgeContent.aggregate([
      {
        $match: {
          isActive: true,
          topic: topicId.toString(),
          type: knowledgeContentType.article,
        },
      },
      {
        $group: {
          _id: '$author',
          total: { $sum: 1 },
        },
      },
    ]);

    return payload;
  }

  static async getContentByIdLocal(contentId: string, type: string): Promise<KnowledgeContentType<string>> {
    return await KnowledgeContent.findOne({ id: contentId, type }).lean();
  }
}
