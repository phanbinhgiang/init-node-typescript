/* eslint-disable consistent-return */
/* eslint-disable max-len */
import slug from 'slug';
import StartShipPad from '../../model/startship/StartShipPad';
import StartShipParticipant from '../../model/startship/StartShipParticipant';

const TYPE_OBJ = {
  sell: 'sell',
  claim: 'claim',
};

export const createSlug = (text) => slug(text);

export default class StarshipServices {
  // get list statshipPad
  // createdAt:-1
  // stashipPad
  static async explore(req, res, next) {
    const { page = 1, size = 10 } = req.query;
    const statShipPadData = await StartShipPad.find({}).sort({ createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(size)).limit(parseInt(size))
      .lean();
    req.response = statShipPadData;
    next();
  }

  // stashipPad
  // get Find One
  static async getDetailBySlug(req, res, next) {
    const { id } = req.params;
    const findStatShipPadData = await StartShipPad.findOne({ slug: id }).lean();
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
  }

  static async listingAdmin(req, res, next) {
    // create StashipPad
    // slug gen from infomation.name by function
    // check slug exist if exist => show errMess slugExists

    const { information } = req.body;

    const genSlug = createSlug(information.name);
    if (!genSlug) {
      return next();
    }
    const findStartShipPadData = await StartShipPad.countDocuments({ slug: genSlug });

    if (findStartShipPadData) {
      req.response = { errMess: 'slugExists' };
      return next();
    }

    await StartShipPad.create({ ...req.body, slug: genSlug });
    req.response = true;
    next();
  }
}
