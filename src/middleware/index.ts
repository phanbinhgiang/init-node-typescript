/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable max-len */
/* eslint-disable consistent-return */
import moment from 'moment';
import crypto from 'crypto-js';
import get from 'lodash/get';
import QueryString from 'query-string';
import { getLength, getStorage } from '../worker/function';
import { mess404, mess401, userRole } from './constants';
import { CommonServices, lowerCase, validateEmailRule } from '../common/function';
import User from '../model/user/User';

export default class MiddlewareServices {
  static checkPublicRequest(req, res, next) {
    if (req.get('Signature') === 'undefined' || req.get('Signature') === undefined
    || req.get('Accept') === 'undefined' || req.get('Accept') === undefined
    || req.get('Version') === 'undefined' || req.get('Version') === undefined
    || req.get('Source') === 'undefined' || req.get('Source') === undefined) {
      return res.status(404).send('Your requested URL not found');
    }
    return next();
  }

  static async authorizationAPI(req, res, next) {
    if (!req.get('authorization')) return res.status(404).send(mess404);

    const checkSignature = (user, userAddress) => {
      const stringSignature = req.get('signature');

      let passwordHash;

      if (req.method !== 'GET' && req.method !== 'DELETE') {
        passwordHash = JSON.stringify(req.body);
      } else {
        const lengthObject = Object.keys(req.query).length;
        passwordHash = lengthObject > 0 ? QueryString.stringify(req.query) : {};
      }
      const hashKey = '0xaeb0325a6789f597b4f7c2c4dcb36b1ba4232384ffaf7b24670b71dafc564cec';
      const hashPassword = crypto.HmacSHA256(passwordHash, hashKey).toString();
      if (hashPassword === stringSignature || (getLength(Object.keys(req.query)) === 0 && crypto.HmacSHA256(QueryString.stringify({}), hashKey).toString())) {
        req.user = user;
        req.userAddress = userAddress;
        return next();
      }
      res.status(404).send(mess404);
    };

    const tokenAuthen = req.get('authorization').replace('Bearer ', '');

    const decodeToken = CommonServices.decodeToken(tokenAuthen);

    // Expired token
    if (moment().unix() > get(decodeToken, 'exp')) {
      return res.status(401).send(mess401);
    }

    if (CommonServices.verifyToken(tokenAuthen, process.env.SECRET_TOKEN_APDATER)) {
      const user = lowerCase(decodeToken.id);
      const userAddress = decodeToken.id;

      const getBlock: any = await getStorage('BLOCK_USER');
      if (getLength(getBlock) > 0 && getBlock.includes(user)) return res.status(404).send(mess404);

      if (!validateEmailRule(user)) return res.status(404).send(mess404);

      checkSignature(user, userAddress);
    } else {
      res.status(404).send(mess404);
    }
  }

  static async authorizationAPIAdmin(req, res, next) {
    if (!req.get('authorization')) return res.status(404).send(mess404);

    const tokenAuthen = req.get('authorization').replace('Bearer ', '');

    const decodeToken = CommonServices.decodeToken(tokenAuthen);

    // Expired token
    if (moment().unix() > get(decodeToken, 'exp')) {
      return res.status(401).send(mess401);
    }

    if (CommonServices.verifyToken(tokenAuthen, process.env.SECRET_TOKEN_APDATER)) {
      const user = lowerCase(decodeToken.id);

      const getBlock = await getStorage('BLOCK_USER');
      if (getLength(getBlock) > 0 && getBlock.includes(user)) return res.status(404).send(mess404);
      if (!validateEmailRule(user)) return res.status(404).send(mess404);
      req.user = user;
      next();
    } else {
      res.status(404).send(mess404);
    }
  }

  static async authorizationAdmin(req, res, next) {
    if (!req.user) return res.status(404).send(mess404);
    const user: any = await User.findOne({ id: req.user }, { role: 1, _id: 0 });
    if (!user) return res.status(404).send(mess404);
    if (user.role !== userRole.member) return next();
  }
}
