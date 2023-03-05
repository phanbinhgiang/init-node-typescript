import { createSchema, defaultModel } from '..';

export default createSchema({
  address: defaultModel.string,
  name: defaultModel.string,
  genre: defaultModel.array,
  image: defaultModel.string,
  chain: defaultModel.string,
  tokenAddress: defaultModel.string,
  amount: defaultModel.string,
  isActive: defaultModel.boolean,
  type: defaultModel.string,
  description: defaultModel.string,
}, 'DagoraCard', null, null);
