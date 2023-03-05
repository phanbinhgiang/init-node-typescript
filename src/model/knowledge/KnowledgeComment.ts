import { createSchema, defaultModel } from '..';

export default createSchema({
  id: defaultModel.string, // questionId
  fatherId: defaultModel.string,
  content: defaultModel.string,
  author: defaultModel.string,
  image: defaultModel.string,
  isActive: defaultModel.boolean,
}, 'knowledgeComment', null, null);
