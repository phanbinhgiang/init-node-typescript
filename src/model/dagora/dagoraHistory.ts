import { createSchema, defaultModel } from '..';

export default createSchema({
  hash: defaultModel.string, // tx hash

  // nft data
  address: defaultModel.string, // nft token address
  chain: defaultModel.string,
  id: defaultModel.string,
  name: defaultModel.string,
  image: defaultModel.string,
  from: defaultModel.string, // buyer address
  owner: defaultModel.string, // seller
  // history type
  type: defaultModel.string, // buy sell cancel

  // token data
  amount: defaultModel.number, // token amount
  tokenAddress: defaultModel.string, // token buy address
  price: defaultModel.number, // token amount USD,
  block: defaultModel.number, // need for tracking block

  // auction Field need to check active auction
  isActive: defaultModel.boolean, // check status auction
// eslint-disable-next-line object-curly-newline
}, 'DagoraHistory', null, { field: { hash: 1, chain: 1, address: 1, id: 1 }, options: { unique: true } });
