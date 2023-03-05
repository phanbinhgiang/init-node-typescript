/* eslint-disable no-return-await */
/* eslint-disable no-underscore-dangle */
/* eslint-disable consistent-return */
/* eslint-disable max-len */
import get from 'lodash/get';
import { Response, NextFunction } from 'express';
import { ObjectId } from 'mongoose';
import Interaction from '../../model/interaction/Interaction';
import KnowledgeComment from '../../model/knowledge/KnowledgeComment';
import KnowledgeContent from '../../model/knowledge/KnowledgeContent';
import {
  knowledgeInteractionType, knowledgeContentType, userFilter,
  InteractionType,
  MatchStateType,
  KnowledgeContentType,
  UserType,
} from '../../service/knowledge/constants';
import {
  deleteStore, getLength, getStorage, onlyUnique, saveStorage,
} from '../function';
import UserWorker from '../system/user';
import KnowledgeContentWorker from './knowledgeContent';
import { RequestCustom } from '../../middleware/constants';

const cacheKey = 'KNOWLEDGE_CACHE_VIEW_KEY';
export default class KnowledgeWorker {
  static async getUserInteraction(req: RequestCustom, res: Response, next: NextFunction) {
    const { id } = req.query;
    const payload: InteractionType[] = await Interaction.find({ relatedID: id, type: { $in: [knowledgeInteractionType.vote, knowledgeInteractionType.likeComment, knowledgeInteractionType.bookmark] }, isActive: true }, { id: 1, type: 1 }).lean();
    req.response = payload;
    next();
  }

  static async updateInteraction(req: RequestCustom, res: Response, next: NextFunction) {
    const {
      type: sType, id, createUser, isActive,
    } = req.body;
    const type: string = knowledgeInteractionType[sType];
    if (!type || type === knowledgeInteractionType.view) {
      req.response = { errMess: 'invalidType' };
      return next();
    }
    const countExists: number = type === knowledgeInteractionType.likeComment ? await KnowledgeComment.countDocuments({ _id: id }) : await KnowledgeContent.countDocuments({ _id: id, type: knowledgeContentType.question });
    if (countExists === 0) {
      req.response = { errMess: 'idNotFound' };
      return next();
    }
    const foundInteraction = await Interaction.findOne({ type, id, relatedID: createUser });

    if (foundInteraction) {
      await foundInteraction.updateOne({ isActive });
    } else {
      await Interaction.create({
        id, type, relatedID: createUser, isActive,
      });
    }

    req.response = true;
    next();
  }

  static async getVoteOfQuestion(req: RequestCustom, res: Response, next: NextFunction) {
    const { id, size = 30 } = req.query;
    const foundQuestion: KnowledgeContentType<string> = await KnowledgeContentWorker.getContentByIdLocal(id, knowledgeContentType.question);
    if (!foundQuestion) {
      req.response = { errMess: 'idNotFound' };
      return next();
    }
    const matchState: MatchStateType = { id: foundQuestion._id, type: knowledgeInteractionType.vote, isActive: true };
    if (size === 'all') {
      const payload: InteractionType[] = await Interaction.find(matchState);
      const arrVoter: UserType[] = await UserWorker.getByListLocal(payload.map((it) => it.relatedID[0]), userFilter);
      req.response = { data: arrVoter };
      return next();
    }
    const payload: InteractionType[] = await Interaction.find(matchState).sort({ createdAt: -1 }).limit(parseInt(size));
    const total: number = await Interaction.countDocuments(matchState);
    const arrVoter: UserType[] = await UserWorker.getByListLocal(payload.map((it) => it.relatedID[0]), userFilter);
    req.response = { data: arrVoter, total };

    return next();
  }

  static async getInteractionOfQuestionLocal(id: ObjectId) {
    const payload: InteractionType[] = await Interaction.find({ id: id.toString(), type: { $in: [knowledgeInteractionType.vote, knowledgeInteractionType.view, knowledgeInteractionType.bookmark] }, isActive: true }).lean();
    const totalVote: number = getLength(payload.filter((it) => it.type === knowledgeInteractionType.vote));
    const totalBookmark: number = getLength(payload.filter((it) => it.type === knowledgeInteractionType.bookmark));
    const totalView: number = payload.filter((it) => it.type === knowledgeInteractionType.view).reduce((total, item) => total + parseInt(get(item, 'relatedID[0]', 0)), 0);
    return { totalVote, totalBookmark, totalView };
  }

  static async getInteractionOfCommentLocal(id: ObjectId): Promise<number> {
    return await Interaction.countDocuments({ id: id.toString(), isActive: true, type: knowledgeInteractionType.likeComment });
  }

  static async addInteractionDataLocal(id: string) {
    const key = `KNOWLEDGE-CACHE-${id}`;
    KnowledgeWorker.addKeyCacheRedis(key);

    const storageData: any = await getStorage(key);

    if (storageData) {
      const newData: string = JSON.stringify(storageData.concat([Date.now()]));
      saveStorage(key, newData);
    } else {
      const newData: string = JSON.stringify([Date.now()]);
      saveStorage(key, newData);
    }
  }

  static async getInteractionVoteLocal(listID: string[]): Promise<any[]> {
    const vote: any[] = await Interaction.aggregate([
      {
        $match: {
          id: { $in: listID },
          isActive: true,
          type: knowledgeInteractionType.vote,
        },
      },
      {
        $group: {
          _id: '$id',
          count: { $sum: 1 },
        },
      },
    ]);

    return vote;
  }

  static async getInteractionBookmarkOfUserLocal(userId: string): Promise<InteractionType[]> {
    const bookmark: InteractionType[] = await Interaction.find({
      relatedID: { $in: [userId] },
      isActive: true,
      type: knowledgeInteractionType.bookmark,
    }, 'id').lean();
    return bookmark;
  }

  static async getInteractionViewLocal(listID: string[]): Promise<any[]> {
    const view: any[] = await Interaction.aggregate([
      {
        $match: {
          id: { $in: listID },
          isActive: true,
          type: knowledgeInteractionType.view,
        },
      },
      {
        $group: {
          _id: '$id',
          count: { $sum: { $first: '$relatedID' } },
        },
      },
    ]);

    return view;
  }

  static async addKeyCacheRedis(keyId) {
    const getData = await getStorage(cacheKey);
    if (getData) {
      const newData = getData.concat([keyId]).filter(onlyUnique);
      saveStorage(cacheKey, newData);
    } else {
      saveStorage(cacheKey, [keyId]);
    }
  }

  static async clearKeyViewRedisLocal() {
    saveStorage(cacheKey, []);
  }

  static async addViewToDB(req: RequestCustom, res: Response, next:NextFunction) {
    const allKeys: any = await getStorage(cacheKey);
    if (getLength(allKeys) > 0) {
      await allKeys.reduce(async (total, item) => {
        await total.then(async () => {
          const key = item;
          const viewData = await getStorage(key);

          const id = key.replace('KNOWLEDGE-CACHE-', '');
          if (!id) {
            deleteStore(key);
            return;
          }
          if (viewData) {
            const totalView = getLength(viewData);
            const newData = {
              id,
              type: knowledgeInteractionType.view,
              relatedID: [totalView],
            };
            await Interaction.create(newData);
          }
          deleteStore(key);
        });
      }, Promise.resolve());
      await KnowledgeWorker.clearKeyViewRedisLocal();
    }
    req.response = true;
    next();
  }

  static async clearInteractionOfQuestionLocal(id: string) {
    // const payload = await Interaction.find({ id, type: { $in: [knowledgeInteractionType.bookmark, knowledgeInteractionType.view, knowledgeInteractionType.vote] } })
    // console.log('🚀 ~ file: index.js:138 ~ KnowledgeWorker ~ clearInteractionOfQuestionLocal ~ payload', payload)
    await Interaction.deleteMany({ id, type: { $in: [knowledgeInteractionType.bookmark, knowledgeInteractionType.view, knowledgeInteractionType.vote] } });
  }

  static async clearInteractionOfCommentByList(arrCommentId: string[]) {
    // const payload = await Interaction.find({ id: { $in: arrCommentId }, type: knowledgeInteractionType.likeComment })
    // console.log('🚀 ~ file: index.js:144 ~ KnowledgeWorker ~ clearInteractionOfCommentByList ~ payload', payload)
    await Interaction.deleteMany({ id: { $in: arrCommentId }, type: knowledgeInteractionType.likeComment });
  }
}
