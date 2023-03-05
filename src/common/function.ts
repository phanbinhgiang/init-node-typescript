/* eslint-disable no-useless-escape */
/* eslint-disable arrow-body-style */
/* eslint-disable max-len */
import jwt from 'jsonwebtoken';
import MailChecker from 'mailchecker';
import mongoose from 'mongoose';
import { getStorage } from '../worker/function/index';

export const getLength = (value: any): number => (value ? value.length : 0);

export const genSkipNum = (page: string, size: string): number => (parseInt(page, 10) - 1) * parseInt(size, 10);

export const convertToMongoID = (id) => {
  try {
    return new mongoose.Types.ObjectId(id);
  } catch (err) {
    return new mongoose.Types.ObjectId();
  }
};

export const lowerCase = (value) => {
  return value && typeof (value) === 'string' ? value.toLowerCase() : '';
};

let expiredTimeEmail: any;
let emailWhitelist: any;
const getEmailWhitelist = (isUpdateWhiteList) => {
  const current = Date.now();
  const isOverTime = (current - expiredTimeEmail) > 60000 * 10;

  if (isUpdateWhiteList || isOverTime) {
    expiredTimeEmail = Date.now();
    getStorage('WHITELIST_EMAIL').then((res) => {
      emailWhitelist = res;
    });
    return true;
  }

  if (!emailWhitelist) {
    getStorage('WHITELIST_EMAIL').then((res) => {
      emailWhitelist = res;
    });
  }
  return emailWhitelist || [];
};

export const countDots = (strString, strLetter) => {
  const string = strString.toString();
  return (string.match(RegExp(strLetter, 'g')) || []).length;
};

const BLOCKED_DOMAIN = ['tadipexs.com', 'minimail.gq', 'freeml.net', '1655mail.com', 'iperfectmail.com', 'inboxkitten.com', 'altpano.com', 'anlubi.com', 'catdogmail.live',
  'tadipexs.com', 'teml.net', 'drmail.in', 'revdex.ga', 'btzyud.tk', 'wifaide.ml', 'tagjus.cf', 'donymails.com',
  'ofanda.com', 'odeask.com', 'woopros.com', 'ewebrus.com', 'googlemail.com', 'spymail.one', 'flymail.tk',
  'mail1s.edu.vn',
  'emailfree.cyou',
  'emailao.cyou',
  'email10p.cyou',
  'tempmail1s.cyou',
  'tempmail1s.icu',
  'mail1s.icu',
  'mail1s.cyou',
  'coina.cyou',
  'mail1s.top',
  'mail10p.cyou',
  '1smail.ga',
  '1smail.cf',
  '1smail.tk',
  'conca.cf',
  'conca.ga',
  'cuoly.cf',
  'cuoly.tk',
  'ersteme.ml',
  'ersteme.tk',
  'googlevn.ga',
  'googlevn.gq',
  'hotemail.gq',
  'sayohze.ga',
  'sayohze.ml',
  'skyoi.cf',
  'skyoi.ml',
  'skyoi.tk',
  'tikktok.tk',
  'tikktok.ga',
  'yeuinta.ga',
  'lovemark.ga',
  'picachu.ga',
  'sayohze.ga',
  'skyoi.ga',
  'hotmail.com',
];

export const validateEmailRule = (sEmail) => {
  const whiteListEmail = getEmailWhitelist(false);

  if (whiteListEmail.includes(sEmail)) {
    return true;
  }

  const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  const email = String(sEmail).toLowerCase();

  const isValidCheck = re.test(email);

  // Email first
  if (isValidCheck) {
    const reDomain = /[@](?=(?:[a-zA-Z0-9\.]{5})){1}(?=(?:\D*\d){4})(.*)/;

    // Domain second
    const isInvalidDomain = reDomain.test(email);
    if (isInvalidDomain) return false;

    const splitEmail = email.split('@')[0];
    const splitEmailDomain = email.split('@')[1];

    if (countDots(splitEmail, '\\.') > 1) {
      return false;
    }

    if (BLOCKED_DOMAIN.indexOf(splitEmailDomain) >= 0) return false;

    if (!MailChecker.isValid(email)) {
      return false;
    }

    return true;
  }
  return true;
};

export const checkJSon = (value): boolean => {
  try {
    JSON.parse(value);
  } catch (e) {
    return false;
  }
  return true;
};

export class CommonServices {
  static decodeToken(token) {
    const decodeToken = jwt.decode(token);
    return decodeToken;
  }

  static verifyToken(token, password) {
    return jwt.verify(token, password, (err) => !err);
  }
}

export default getLength;
