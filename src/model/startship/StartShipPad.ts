import { createSchema, defaultModelNew } from '..';

export default createSchema({
  slug: defaultModelNew.stringUnique,
  hash: { type: String },
  chainId: { type: String, required: true },
  information: {
    banner: defaultModelNew.sString,
    logo: defaultModelNew.sString,
    name: defaultModelNew.sString,
    description: defaultModelNew.sString,
    fundraiseGoal: defaultModelNew.sString,

  },
  content: defaultModelNew.sString,
  token0: {
    address: { type: String, required: true },
    price: defaultModelNew.number,
    symbol: defaultModelNew.sString,
  },
  token1: {
    address: { type: String, required: true },
    price: defaultModelNew.number,
  },
  contract: {
    id: defaultModelNew.sString,
    address: defaultModelNew.sString, // check with
    owner: defaultModelNew.sString,
    signer: defaultModelNew.sString,
    privateSignature: defaultModelNew.sString,
    limitToken: defaultModelNew.number,
    limitPerUser: defaultModelNew.number,
  },
  date: {
    regStart: defaultModelNew.number,
    regEnd: defaultModelNew.number,
    sellStart: defaultModelNew.number,
    sellEnd: defaultModelNew.number,
    claimStart: defaultModelNew.number,
    claimEnd: defaultModelNew.number,
  },
  status: defaultModelNew.sObject,
  social: defaultModelNew.sObject,
  isPrivate: defaultModelNew.booleanFalse,
  whitelist: defaultModelNew.sString,
  isActive: defaultModelNew.boolean,
}, 'StarshipPad', null, null);
