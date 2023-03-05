import { createSchema, defaultModel } from '..';

export default createSchema({
  id: defaultModel.stringUnique,
  campaign: defaultModel.string,
  user: defaultModel.string,
  token: defaultModel.string,
  signature: defaultModel.string,
  lang: defaultModel.string,
}, 'Participant', null, null);
