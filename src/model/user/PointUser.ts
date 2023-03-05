import { createSchema, defaultModel } from '..';

export default createSchema({
  id: defaultModel.stringUnique,
  volume: defaultModel.number,
  amount: defaultModel.number,
  previousAmount: defaultModel.number,
  bonusValue: defaultModel.object,
  percent: defaultModel.number,
  type: { type: String, default: 'trade' },
  fromUser: defaultModel.string,
  createdUser: defaultModel.string,
}, 'PointUser', null, null);
