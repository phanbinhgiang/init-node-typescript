import { createSchema, defaultModel } from '..';

export default createSchema({
  // Core fields
  slug: defaultModel.stringUnique, // Link params on website
  title: defaultModel.string,
  image: {
    dark: String, light: String, darkColor: String, lightColor: String,
  },
  cover: {
    dark: String, light: String, darkColor: String, lightColor: String,
  },
  description: defaultModel.string,
  content: defaultModel.string,
  note: defaultModel.string,
  displayType: defaultModel.string,
  status: defaultModel.stringStatus,
  publishDate: defaultModel.number,
  blockContent: defaultModel.object,
  // SEO fields
  seoTitle: defaultModel.string,
  seoDescription: defaultModel.string,
  seoKeyword: defaultModel.string,
  seoImage: defaultModel.string,
  seoslug: defaultModel.string,
  altImage: defaultModel.string,
  // Support fields
  relatedID: defaultModel.string,
  isActive: defaultModel.boolean,
  createdAt: defaultModel.date,
  updatedList: defaultModel.array,
  lang: { type: String, default: 'gb' },
  selectedTokens: [
    {
      id: defaultModel.string,
    },
  ], // [{id},{id}] id = cgkId
  universalLink: defaultModel.string,
  // Join from tags collection
  tags: defaultModel.array,
  // Join from user collection
  author: defaultModel.string,
  designer: defaultModel.string,
  // join post difficulty collection
  interactionLevel: defaultModel.string,
  showDisclaimer: defaultModel.boolean,
  // pdf link
  pdfContent: defaultModel.string,

  orgKey: defaultModel.string,
  domain: defaultModel.string,
  // youtube link
  youtubeUrl: defaultModel.string,
  videoDuration: defaultModel.number,

  // background color
  backgroundColor: defaultModel.string,
}, 'Post', null, null);
