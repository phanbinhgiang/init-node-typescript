import { createSchema, defaultModel } from '..';

export default createSchema({
  id: defaultModel.stringUnique,
  createdUser: defaultModel.array,
  lastSync: defaultModel.date,
  numSync: defaultModel.number,
  source: defaultModel.string,
  os: defaultModel.string,
  isActive: defaultModel.boolean,
}, 'DeviceSource', null, null);
