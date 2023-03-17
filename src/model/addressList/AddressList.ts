import { Document } from 'mongoose';
import { createSchema, defaultModel } from '..';

export default createSchema({
  id: defaultModel.string,
  chain: defaultModel.string,
  numCreated: defaultModel.number,
  lastCreated: defaultModel.date,
  source: defaultModel.string,
  createdUser: defaultModel.array,
  isMulti: defaultModel.boolean,
}, 'AddressList', null, null);

export interface AddressListInterface extends Document {
  _id: string,
  id?: string,
  chain?: string,
  numCreated?: number,
  lastCreated?: Date,
  source?: string,
  createdUser?: string[],
  isMulti?: boolean,
}
