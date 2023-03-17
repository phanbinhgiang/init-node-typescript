import { createSchema, defaultModel } from '..';

export default createSchema({
  id: defaultModel.stringUnique,
  createdUser: defaultModel.array,
  lastSync: defaultModel.date,
  numSync: defaultModel.number,
  source: defaultModel.string,
  os: defaultModel.string,
  isActive: defaultModel.boolean,
  createdAt: defaultModel.date,
}, 'DeviceSource', null, null);

export interface DeviceSourceInterface {
  id: string,
  createdUser: string[],
  lastSync: Date,
  numSync: number,
  source: string,
  os: string,
  isActive: boolean,
  createdAt: Date,
}
