import { createSchema, defaultModel } from '..';

export default createSchema({
  dateStart: defaultModel.date,
  dateEnd: defaultModel.date,
  type: defaultModel.string,
  volumeAddressToken: defaultModel.array,
  totalTransaction: defaultModel.number,
  totalViews: defaultModel.array,
  topViews: defaultModel.array,
  topBuyer: defaultModel.array,
  volumeAll: defaultModel.number,
  volumeChain: defaultModel.array,
  topSeller: defaultModel.array,
  topCollection: defaultModel.array,
  totalTx: defaultModel.number,
  avaPrice: defaultModel.number,
}, 'DagoraReport', null, null);
