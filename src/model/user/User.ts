import { createSchema, defaultModel } from '..';

export default createSchema({
  id: defaultModel.string,
  name: defaultModel.string,
  refId: defaultModel.string,
  userNameProfile: defaultModel.string,
  image: defaultModel.string,
}, 'User', null, null);
