import { createSchema, defaultModel } from '..';

export default createSchema({
  slug: defaultModel.stringUnique,
  title: defaultModel.string,
  description: defaultModel.string,
  logo: defaultModel.string,
  banner: defaultModel.array,
  isPinned: defaultModel.booleanFalse,
  weight: defaultModel.number,
  tags: defaultModel.array,
  isActive: defaultModel.boolean,
  createdUser: defaultModel.string,
  source: defaultModel.string,
}, 'Genre', null, null);
