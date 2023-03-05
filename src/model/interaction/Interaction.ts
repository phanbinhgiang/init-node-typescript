import { createSchema, defaultModel } from '..';

export default createSchema({
  id: defaultModel.string, // postID || cmt id (type= like)
  type: defaultModel.string,
  reUpdatedList: defaultModel.array, // tracking User Interaction
  relatedID: defaultModel.array, // user ID
  isActive: defaultModel.boolean,
  locale: defaultModel.string,
  orgID: defaultModel.string,
  info: defaultModel.object,
  theme: defaultModel.object,
  font: defaultModel.object,
}, 'Interaction', null, null);
