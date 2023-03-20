import { createSchema, defaultModel } from '..';

export default createSchema({
  time: defaultModel.number,
  id: defaultModel.stringUnique,
  data: defaultModel.object,
}, 'RecordCacheData', null, null);
