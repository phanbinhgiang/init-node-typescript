import { genSkipNum, getLength } from '../../common/function';
import DagoraCard from '../../model/dagora/DagoraCard';

export default class DagoraCardWorker {
  static async getFilterCardAdmin(req, res, next) {
    const {
      keyword, chain, genre, page = 1, size = 20,
    } = req.query;

    console.log('🚀 ~ file: dagoraCard.ts:8 ~ DagoraCardWorker ~ getFilterCardAdmin ~ keyword', keyword);

    type MatchState = {
      name?: object,
      chain?: string,
      genre?: string
    }

    const matchState: MatchState = {};

    if (getLength(keyword) > 0) {
      matchState.name = { $regex: `.*${keyword}.*`, $options: 'i' };
    }

    if (getLength(chain) > 0) {
      matchState.chain = chain;
    }

    if (getLength(genre) > 0) {
      matchState.genre = genre;
    }

    const payload = await DagoraCard.find(matchState).sort({ createdAt: -1 })
      .skip(genSkipNum(page, size)).limit(parseInt(size));
    const total = await DagoraCard.countDocuments(matchState);

    req.response = {
      data: payload,
      total,
      totalPage: Math.ceil(total / size),
      currPage: parseInt(page),
    };
    next();
  }
}
