import { createSchema, defaultModel } from '..';

export default createSchema({
  ip: defaultModel.string,
  type: defaultModel.string,
  createdUser: defaultModel.string,
  country: defaultModel.string,
  time: defaultModel.number,
}, 'IPUser', null, null);
