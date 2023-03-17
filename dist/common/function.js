"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertCheckSUM = exports.CommonServices = exports.checkJSon = exports.validateEmailRule = exports.countDots = exports.lowerCase = exports.convertToMongoID = exports.genSkipNum = exports.getLength = void 0;
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-useless-escape */
/* eslint-disable arrow-body-style */
/* eslint-disable max-len */
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const mailchecker_1 = __importDefault(require("mailchecker"));
const mongoose_1 = __importDefault(require("mongoose"));
const web3_1 = __importDefault(require("web3"));
const index_1 = require("../worker/function/index");
const getLength = (value) => (value ? value.length : 0);
exports.getLength = getLength;
const genSkipNum = (page, size) => (parseInt(page, 10) - 1) * parseInt(size, 10);
exports.genSkipNum = genSkipNum;
const convertToMongoID = (id) => {
    try {
        return new mongoose_1.default.Types.ObjectId(id);
    }
    catch (err) {
        return new mongoose_1.default.Types.ObjectId();
    }
};
exports.convertToMongoID = convertToMongoID;
const lowerCase = (value) => {
    return value && typeof (value) === 'string' ? value.toLowerCase() : '';
};
exports.lowerCase = lowerCase;
let expiredTimeEmail;
let emailWhitelist;
const getEmailWhitelist = (isUpdateWhiteList) => {
    const current = Date.now();
    const isOverTime = (current - expiredTimeEmail) > 60000 * 10;
    if (isUpdateWhiteList || isOverTime) {
        expiredTimeEmail = Date.now();
        (0, index_1.getStorage)('WHITELIST_EMAIL').then((res) => {
            emailWhitelist = res;
        });
        return true;
    }
    if (!emailWhitelist) {
        (0, index_1.getStorage)('WHITELIST_EMAIL').then((res) => {
            emailWhitelist = res;
        });
    }
    return emailWhitelist || [];
};
const countDots = (strString, strLetter) => {
    const string = strString.toString();
    return (string.match(RegExp(strLetter, 'g')) || []).length;
};
exports.countDots = countDots;
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
const validateEmailRule = (sEmail) => {
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
        if (isInvalidDomain)
            return false;
        const splitEmail = email.split('@')[0];
        const splitEmailDomain = email.split('@')[1];
        if ((0, exports.countDots)(splitEmail, '\\.') > 1) {
            return false;
        }
        if (BLOCKED_DOMAIN.indexOf(splitEmailDomain) >= 0)
            return false;
        if (!mailchecker_1.default.isValid(email)) {
            return false;
        }
        return true;
    }
    return true;
};
exports.validateEmailRule = validateEmailRule;
const checkJSon = (value) => {
    try {
        JSON.parse(value);
    }
    catch (e) {
        return false;
    }
    return true;
};
exports.checkJSon = checkJSon;
class CommonServices {
    static decodeToken(token) {
        const decodeToken = jsonwebtoken_1.default.decode(token);
        return decodeToken;
    }
    static verifyToken(token, password) {
        return jsonwebtoken_1.default.verify(token, password, (err) => !err);
    }
}
exports.CommonServices = CommonServices;
exports.default = exports.getLength;
const convertCheckSUM = (address) => {
    const web3 = new web3_1.default();
    try {
        return address ? web3.utils.toChecksumAddress(address) : address;
    }
    catch (error) {
        return null;
    }
};
exports.convertCheckSUM = convertCheckSUM;
//# sourceMappingURL=function.js.map