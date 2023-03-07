import { createSchema, defaultModel } from '..';

export default createSchema({
  id: defaultModel.stringUnique,
  hash: defaultModel.string,
  block: defaultModel.number,
  partner: defaultModel.string,
  partnerId: defaultModel.string,

  numChecked: defaultModel.number,

  status: defaultModel.booleanFalse,
  isVerify: defaultModel.booleanFalse,

  impact: defaultModel.number,
  slippage: defaultModel.number,

  fee: defaultModel.number,
  gasLimit: defaultModel.number,
  gasPrice: defaultModel.number,

  source: defaultModel.string,
  volume: defaultModel.number,
  // symbol, address, decimals
  token0: defaultModel.object,
  token1: defaultModel.object,

  token0Rate: defaultModel.number,
  token1Rate: defaultModel.number,
  chain: defaultModel.string,

  inputAmount: defaultModel.number,
  outputAmount: defaultModel.number,

  from: defaultModel.string,
  createdUser: defaultModel.string,

  factory: defaultModel.array,
  isActive: defaultModel.boolean,

}, 'AggregatorHistory', null, null);
