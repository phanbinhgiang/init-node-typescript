import { createSchema, defaultModelNew } from '..';

export default createSchema({
  id: defaultModelNew.string,
  address: defaultModelNew.sString,
  chain: defaultModelNew.sString,
  register: {
    hash: defaultModelNew.sString,
  },
  sell: {
    hash: [defaultModelNew.string],
    amount: [defaultModelNew.number],
  },
  claim: {
    hash: defaultModelNew.sString,
    amount: defaultModelNew.number,
  },
  hash: defaultModelNew.sString,

}, 'StarshipParticipant', null, null);
