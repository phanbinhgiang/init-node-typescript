/* eslint-disable consistent-return */
/* eslint-disable max-len */
import slug from 'slug';
import StartShipPad from '../../model/startship/StartShipPad';
import StartShipParticipant from '../../model/startship/StartShipParticipant';
import { convertCheckSUM } from '../../common/function';
import { genUpdate } from '../function';
import EVMServices from '../../service/evm/evmService';

const TYPE_OBJ = {
  sell: 'sell',
  claim: 'claim',
};

const CONTRACT_CHECK = '0x7B11a60E3Fbe021dD3faa48B49598B7Ff0C667A4';

export const createSlug = (text) => slug(text);

export default class StarshipServices {
  // get list statshipPad
  // createdAt:-1
  // stashipPad
  static async explore(req, res, next) {
    const {
      page = 1, size = 10, key,
    } = req.query;

    const matchFind = key ? {
      $or: [
        { 'information.name': { $regex: key, $options: 'i' } },
        { 'information.description': { $regex: key, $options: 'i' } },
      ],
    } : {};
    const statShipPadData = await StartShipPad.find(matchFind)
      .sort({ createdAt: -1, 'token0.price': -1, 'token1.price': -1 })
      .skip((parseInt(page) - 1) * parseInt(size)).limit(parseInt(size))
      .lean();
    req.response = statShipPadData;
    next();
  }
  // search key words, sort by (time, price)

  // stashipPad
  // get Find One
  static async getDetailBySlug(req, res, next) {
    const { id } = req.params;
    const findStatShipPadData = await StartShipPad.findOne({ slug: id }).lean();
    if (!findStatShipPadData) {
      req.response = { errMess: `documentNotFoundWithSlug:${id}` };
      return next();
    }
    req.response = findStatShipPadData;
    next();
  }

  static async register(req, res, next) {
    // body chain,id,address,registerHash
    // create DAta
    // model startshipparticipant
    // check Exists by address and id
    //  if Exists =>req.response = {errMess:"alreadyRegister"}
    // return next()

    const {
      chain, id, address, hash,
    } = req.body;

    const detailTxs = await EVMServices.getTxsByHash(chain, hash);
    if (!detailTxs) {
      req.response = { errMess: 'TxsNotFound' };
      return next();
    }

    if (convertCheckSUM(detailTxs.to) !== CONTRACT_CHECK) {
      req.response = { errMess: 'contractInvalid' };
      return next();
    }

    const findStartShipParticipantData = await StartShipParticipant.countDocuments({ id, chain, address });
    if (findStartShipParticipantData) {
      req.response = { errMess: 'alreadyRegister' };
      return next();
    }
    await StartShipParticipant.create({
      id, address, chain, register: { hash },
    });
    req.response = true;
    next();

    //
  }

  static async logRecord(req, res, next) {
    // body address,chain,id ,type,hash,amount
    // model starship participant
    // checkExists
    // not Exists errMess = notRegister

    // type Claim check old Claimed Data if exist data => errMess: alreadyClaim
    // type Sell update data sell push hash and amount=>update

    const {
      chain, id, address, hash, type = TYPE_OBJ.sell, amount,
    } = req.body;

    const detailTxs = await EVMServices.getTxsByHash(chain, hash);
    if (!detailTxs) {
      req.response = { errMess: 'TxsNotFound' };
      return next();
    }

    if (convertCheckSUM(detailTxs.to) !== CONTRACT_CHECK) {
      req.response = { errMess: 'contractInvalid' };
      return next();
    }

    const findStartShipParticipantData: any = await StartShipParticipant.findOne({ id, chain, address });

    if (!findStartShipParticipantData) {
      req.response = { errMess: 'notRegister' };
      return next();
    }

    if (!TYPE_OBJ[type]) {
      req.response = { errMess: 'typeErr' };
      return next();
    }

    if (TYPE_OBJ[type] === TYPE_OBJ.sell) {
      const currentHash = findStartShipParticipantData.sell.hash;
      const currentAmount = findStartShipParticipantData.sell.amount;
      await findStartShipParticipantData.update({
        sell:
        { hash: [...currentHash, hash], amount: [...currentAmount, amount] },
      });
      req.response = true;
      next();
    }

    if (TYPE_OBJ[type] === TYPE_OBJ.claim) {
      const findClaim = findStartShipParticipantData.claim;
      if (findClaim?.hash && findClaim?.amount) {
        req.response = { errMess: 'alreadyClaim' };
        return next();
      }
      await findStartShipParticipantData.update({
        claim: { hash, amount },
      });
      req.response = true;
      next();
    }

    // check hash to === ''
  }

  static async listingAdmin(req, res, next) {
    // create StashipPad
    // slug gen from infomation.name by function
    // check slug exist if exist => show errMess slugExists

    const {
      hash, chainId, information, content, token0, token1, contract, date, status, social, isPrivate, whitelist, isActive,
    } = req.body;

    if (convertCheckSUM(contract.address) !== CONTRACT_CHECK) {
      req.response = { errMess: 'contractInvalid' };
      return next();
    }

    const genSlug = createSlug(information.name);
    if (!genSlug) {
      return next();
    }
    const findStartShipPadData: any = await StartShipPad.countDocuments({ slug: genSlug });

    if (findStartShipPadData) {
      req.response = { errMess: 'slugExists' };
      return next();
    }

    const newData = {
      slug: genSlug, hash, chainId, information, content, token0, token1, contract, date, status, social, isPrivate, whitelist, isActive,
    };

    await StartShipPad.create(newData);
    req.response = true;
    next();
  }

  static async update(req, res, next) {
    const { id } = req.body;

    const updatedFiled = genUpdate(req.body, ['hash', 'chainId', 'information', 'content', 'token0', 'token1', 'contract', 'date', 'status', 'social', 'isPrivate', 'whitelist', 'isActive']);
    const { information } = updatedFiled;
    if (information) {
      const genSlug = createSlug(information.name);
      const countSlugExists = await StartShipPad.countDocuments({ slug: genSlug, _id: { $ne: id } });
      if (countSlugExists) {
        req.response = { errMess: 'slugExists' };
        return next();
      }
    }
    StartShipPad.findOneAndUpdate({ _id: id }, updatedFiled, { new: true }, (err, result) => {
      if (!err || result) {
        req.response = result;
        next();
      } else {
        req.response = false;
        next();
      }
    });
  }

  static async delete(req, res, next) {
    const { id } = req.params;

    const findStartShipPadData: any = await StartShipPad.findOne({ _id: id });

    if (!findStartShipPadData) {
      req.response = { errMess: 'documentIdNotFound' };
      return next();
    }

    if (!findStartShipPadData.isActive) {
      req.response = { errMess: 'documentIsDeleted' };
      return next();
    }

    await findStartShipPadData.update({ isActive: false });
    req.response = true;
    next();
  }
}
