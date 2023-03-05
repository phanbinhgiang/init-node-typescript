import { createSchema, defaultModel } from '..';

export default createSchema({
  id: defaultModel.string,
  title: defaultModel.string,
  author: defaultModel.string,
  description: defaultModel.string,
  content: defaultModel.string,
  topic: defaultModel.string,
  category: defaultModel.string,
  type: defaultModel.string, // defind type of content article, FAQs, Questions
  image: defaultModel.string,
  isActive: defaultModel.boolean,
}, 'knowledgeContent', null, null);
