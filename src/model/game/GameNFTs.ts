import { createSchema, defaultModel } from '..';

export default createSchema({
  id: defaultModel.string,
  ids: defaultModel.array,
  user: defaultModel.string,
  address: defaultModel.string,
  owner: defaultModel.string,
  pointOwner: { type: String },
  historyOwner: defaultModel.object,
  point: defaultModel.number,
  pointCheck: defaultModel.booleanFalse,
  isVerify: defaultModel.booleanFalse,
}, 'GameNFTs', null, null);
