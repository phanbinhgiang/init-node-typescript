/* eslint-disable arrow-body-style */
/* eslint-disable no-return-await */
/* eslint-disable consistent-return */
/* eslint-disable no-underscore-dangle */
/* eslint-disable max-len */
import { Response, NextFunction } from 'express';
import KnowledgeWorker from '.';
import { RequestCustom } from '../../middleware/constants';
import KnowledgeComment from '../../model/knowledge/KnowledgeComment';
import { genSortStateMongo } from '../../service/functions';
import {
  KnowledgeCommentType, knowledgeContentType, KnowledgeContentType, MatchStateType,
  UserType,
} from '../../service/knowledge/constants';
import { genUpdate, genSkipNum } from '../function';
import UserWorker from '../system/user';
import KnowledgeContentWorker from './knowledgeContent';

export default class KnowledgeCommentWorker {
  static async getQuestionComment(req: RequestCustom, res: Response, next: NextFunction) {
    const {
      id, page = 1, size = 10, sort = '-createdAt',
    } = req.query;
    const foundQuestion: KnowledgeContentType<string> = await KnowledgeContentWorker.getContentByIdLocal(id, knowledgeContentType.question);
    if (!foundQuestion) {
      req.response = { errMess: 'idNotFound' };
      return next();
    }
    const matchState: MatchStateType = {
      id: foundQuestion._id.toString(),
      fatherId: '',
      isActive: true,
    };

    const payload: KnowledgeCommentType[] = await KnowledgeComment.find(matchState, {
      author: 1, content: 1, createdAt: 1, image: 1,
    }).sort(genSortStateMongo(sort)).skip(genSkipNum(page, size)).limit(parseInt(size))
      .lean();
    const total: number = await KnowledgeComment.countDocuments(matchState);
    req.response = {
      data: await KnowledgeCommentWorker.formatCommentDataLocal(payload, true),
      total,
      totalPage: Math.ceil(total / parseInt(size)),
      currPage: parseInt(page),
    };

    next();
  }

  static async getChildComment(req: RequestCustom, res: Response, next: NextFunction) {
    const { fatherId, sort = 'createdAt' } = req.query;

    const matchState: MatchStateType = {
      fatherId,
      isActive: true,
    };

    const payload: KnowledgeCommentType[] = await KnowledgeComment.find(matchState, {
      author: 1, content: 1, createdAt: 1, image: 1,
    }).sort(genSortStateMongo(sort)).lean();
    req.response = await KnowledgeCommentWorker.formatCommentDataLocal(payload, false);
    next();
  }

  static async formatCommentDataLocal(arrComment: any[], isCountChild: boolean = true): Promise<any[]> {
    return await Promise.all(arrComment.map(async (it) => {
      const countChildComment: number = isCountChild ? await KnowledgeComment.countDocuments({ fatherId: it._id, isActive: true }) : 0;
      const author: UserType = await UserWorker.getByIdLocal(it.author, {
        name: 1, image: 1, _id: 0, id: 1,
      });
      const totalLike: number = await KnowledgeWorker.getInteractionOfCommentLocal(it._id);
      return Object.assign(it, { totalReply: countChildComment, author, totalLike });
    }));
  }

  static async create(req: RequestCustom, res: Response, next: NextFunction) {
    const {
      id, fatherId, content, author, image,
    } = req.body;

    await KnowledgeComment.create({
      id, fatherId, content, author, image,
    });

    req.response = true;
    next();
  }

  static async update(req: RequestCustom, res: Response, next: NextFunction) {
    const { id } = req.body;

    const updateFiled: any = genUpdate(req.body, ['content', 'image']);

    KnowledgeComment.findOneAndUpdate({ _id: id }, updateFiled, { new: true }, (err, result) => {
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
    // const user = req.user
    const countExists: number = await KnowledgeComment.countDocuments({ _id: id });
    if (countExists === 0) {
      req.response = { errMess: 'idNotFound' };
      return next();
    }
    await KnowledgeComment.deleteOne({ _id: id });
    await KnowledgeComment.deleteMany({ fatherId: id });
    req.response = true;
    next();
  }

  //* Local
  static async getTotalCommentOfQuestionLocal(id: string): Promise<number> {
    return await KnowledgeComment.countDocuments({ id });
  }

  static async deleteCommentOfQuestionLocal(id: string) {
    const allComment: KnowledgeCommentType[] = await KnowledgeComment.find({ id }, { _id: 1 });
    await KnowledgeWorker.clearInteractionOfCommentByList(allComment.map((it) => it._id.toString()));
    await KnowledgeComment.deleteMany({ id });
  }
}
