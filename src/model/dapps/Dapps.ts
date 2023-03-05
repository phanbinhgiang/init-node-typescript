import { createSchema, defaultModel } from '..';

export default createSchema({
  slug: defaultModel.stringUnique,
  title: defaultModel.string,
  description: defaultModel.string,
  descriptionMobile: defaultModel.string,
  logo: defaultModel.string,
  banner: defaultModel.array,
  bannerMobile: defaultModel.array,
  url: defaultModel.string,
  genre: defaultModel.array,

  cgkId: defaultModel.string,
  chain: defaultModel.array,
  isPinned: defaultModel.booleanFalse,
  weight: defaultModel.number,
  tags: defaultModel.array,
  social: defaultModel.object,
  isActive: defaultModel.boolean,
}, 'Dapps', null, null);
