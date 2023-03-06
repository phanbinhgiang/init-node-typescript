import { createSchema, defaultModel } from '..';

export default createSchema({
  id: defaultModel.string,
  chain: defaultModel.string,
  numCreated: defaultModel.number,
  lastCreated: defaultModel.date,
  source: defaultModel.string,
  createdUser: defaultModel.array,
  isMulti: defaultModel.boolean,
}, 'AddressList', null, null);
