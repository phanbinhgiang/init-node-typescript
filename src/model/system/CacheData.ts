import { createSchema, defaultModel } from '..';

export default createSchema({
  time: defaultModel.number,
  id: defaultModel.stringUnique,
  data: defaultModel.string,
  array: defaultModel.array,
  object: defaultModel.object,
}, 'CacheData', null, null);

export interface CacheDataInterface {
  time: number,
  id: string,
  data?: string,
  array?: [],
  object?: object,
}
