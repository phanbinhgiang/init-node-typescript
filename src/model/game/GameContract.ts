import { createSchema, defaultModel } from '..';

export default createSchema({
  id: defaultModel.stringUnique,
  values: defaultModel.object,
  owner: defaultModel.string,

  pointCheck: defaultModel.booleanFalse,
  isVerify: defaultModel.booleanFalse,

}, 'GameContract', null, null);
