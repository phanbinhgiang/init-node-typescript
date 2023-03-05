import { createSchema, defaultModel } from '..';

export default createSchema({
  id: defaultModel.stringUnique,
  title: defaultModel.string,
  author: defaultModel.string,
  category: [
    {
      title: defaultModel.string,
    },
  ],
  image: defaultModel.string,
  description: defaultModel.string,
  isActive: defaultModel.boolean,
}, 'knowledgeTopic', null, null);
