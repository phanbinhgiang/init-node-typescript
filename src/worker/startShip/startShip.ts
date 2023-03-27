/* eslint-disable no-shadow */
/* eslint-disable no-unused-vars */
/* eslint-disable consistent-return */
/* eslint-disable max-len */
import slug from 'slug';
import StarshipPad from '../../model/startship/StartShipPad';
import StarshipParticipant from '../../model/startship/StartShipParticipant';
import { genUpdate } from '../function';
import EVMServices from '../../service/evm/evmService';
import { convertCheckSUM as convertSUM } from '../../common/function';

const TYPE_OBJ = {
  sell: 'sell',
  claim: 'claim',
};

// ErrMessage
// padNotFound: Pad Not found

const SIGN_TYPE = 'starship';

const ERR_MESSAGE = {
  notInWhiteList: 'notInWhiteList',
  alreadyRegister: 'alreadyRegister',
  padNotFound: 'padNotFound',
  invalidHash: 'invalidHash',
};

const STARSHIP_FACTORY = {
  97: '0xe0C3d8D1dac3b6139a2fC5aD29Fb47d2C87cd053',
};

export const createSlug = (text) => slug(text);

export default class StarshipServices {
  static async explore(req, res, next) {
    const {
      page = 1, size = 10, key, sort,
    } = req.query;

    const matchFind = key ? {
      $or: [
        { 'information.name': { $regex: key, $options: 'i' } },
        { 'information.description': { $regex: key, $options: 'i' } },
      ],
    } : {};
    const padList = await StarshipPad.find(matchFind)
      .sort({ createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(size)).limit(parseInt(size))
      .lean();

    // Count participant in here

    req.response = padList;
    next();
  }

  static async getDetailBySlug(req, res, next) {
    const { id } = req.params;
    const payload = await StarshipPad.findOne({ slug: id }).lean();
    req.response = payload || { errMess: ERR_MESSAGE.padNotFound };
    return next();
  }

  static async registerSignature(req, res, next) {
    const { slug, chain } = req.query;
    const starShipPad: any = await StarshipPad.findOne({ slug }, { _id: 0, contract: 1, whitelist: 1 });

    if (!starShipPad) {
      req.response = { errMess: ERR_MESSAGE.padNotFound };
      return next();
    }

    const whitelist = starShipPad.whitelist.split(';');
    if (whitelist.indexOf(req.address.toLowerCase()) === -1) {
      req.response = { errMess: ERR_MESSAGE.notInWhiteList };
      return next();
    }
    // const signature = await EVMServices.signWhiteList({
    //   contract: starShipPad.contract.address,
    //   chain,
    //   user: req.address,
    //   type: SIGN_TYPE,
    // });
    // req.response = signature;
    req.response = true;
    return next();
  }

  static async register(req, res, next) {
    const { chain, id, hash } = req.body;

    const starShipPad: any = await StarshipPad.findOne({ slug: id }, { _id: 0, contract: 1 });

    if (!starShipPad) {
      req.response = { errMess: ERR_MESSAGE.padNotFound };
      return next();
    }

    const txsDetail = await EVMServices.getTxsByHashRequest(chain, hash);
    if (!txsDetail) {
      req.response = { errMess: ERR_MESSAGE.invalidHash };
      return next();
    }

    if (convertSUM(txsDetail.to) !== starShipPad.contract.address) {
      req.response = { errMess: ERR_MESSAGE.invalidHash };
      return next();
    }

    const countJoined = await StarshipParticipant.countDocuments({ id: slug, address: convertSUM(req.address) });
    if (countJoined > 0) {
      req.response = { errMess: ERR_MESSAGE.alreadyRegister };
      return next();
    }

    await StarshipParticipant.create({
      id: slug, address: convertSUM(req.address), chain, register: { hash },
    });
    req.response = true;
    next();
  }

  static async logRecord(req, res, next) {
    // body address,chain,id ,type,hash,amount
    // model starship participant
    // checkExists
    // not Exists errMess = notRegister

    // type Claim check old Claimed Data if exist data => errMess: alreadyClaim
    // type Sell update data sell push hash and amount=>update

    // Need onchain signature

    const {
      chain, id, hash, type = TYPE_OBJ.sell, amount,
    } = req.body;

    // const detailTxs = await EVMServices.getTxsByHash(chain, hash)
    // if (!detailTxs) {
    //   req.response = { errMess: 'TxsNotFound' }
    //   return next()
    // }

    // if (convertSUM(detailTxs.to) !== CONTRACT_CHECK) {
    //   req.response = { errMess: 'contractInvalid' }
    //   return next()
    // }

    // const findStartShipParticipantData = await StartShipParticipant.findOne({ id, chain, address })

    // if (!findStartShipParticipantData) {
    //   req.response = { errMess: 'notRegister' }
    //   return next()
    // }

    // if (!TYPE_OBJ[type]) {
    //   req.response = { errMess: 'typeErr' }
    //   return next()
    // }

    // if (TYPE_OBJ[type] === TYPE_OBJ.sell) {
    //   const currentHash = findStartShipParticipantData.sell.hash
    //   const currentAmount = findStartShipParticipantData.sell.amount
    //   await findStartShipParticipantData.update({
    //     sell:
    //       { hash: [...currentHash, hash], amount: [...currentAmount, amount] }
    //   })
    //   req.response = true
    //   next()
    // }

    // if (TYPE_OBJ[type] === TYPE_OBJ.claim) {
    //   const findClaim = findStartShipParticipantData.claim
    //   if (findClaim?.hash && findClaim?.amount) {
    //     req.response = { errMess: 'alreadyClaim' }
    //     return next()
    //   }
    //   await findStartShipParticipantData.update({
    //     claim: { hash, amount }
    //   })
    //   req.response = true
    //   next()
    // }

    // check hash to === ''
  }

  static async listingAdmin(req, res, next) {
    const {
      hash, chainId, information, content, token0, token1, contract, date, status, social, isPrivate, whitelist, isActive,
    } = req.body;

    const genSlug = createSlug(information.name);
    if (!genSlug) {
      return next();
    }
    const findStarshipPadData = await StarshipPad.countDocuments({ slug: genSlug });

    if (findStarshipPadData) {
      req.response = { errMess: 'slugExists' };
      return next();
    }

    const newData = {
      slug: genSlug,
      hash,
      chainId,
      information,
      content,
      token0,
      token1,
      contract,
      date,
      status,
      social,
      isPrivate,
      whitelist,
      isActive,
    };
    await StarshipPad.create(newData);
    req.response = true;
    next();
  }

  static async updateAdmin(req, res, next) {
    const { id } = req.body;

    const updatedFiled = genUpdate(req.body, ['information', 'content', 'token0', 'token1', 'social']);

    StarshipPad.findOneAndUpdate({ _id: id }, updatedFiled, { new: true }, (err, result) => {
      if (!err || result) {
        req.response = result;
        next();
      } else {
        req.response = false;
        next();
      }
    });
  }

  static async deleteAdmin(req, res, next) {
    const { id } = req.params;

    const payload = await StarshipPad.findOne({ _id: id }, { _id: 1 });

    if (!payload) {
      req.response = { errMess: 'padNotFound' };
      return next();
    }
    await payload.updateOne({ isActive: false });
    req.response = true;
    next();
  }
}
