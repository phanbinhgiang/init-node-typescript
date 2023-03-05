import { createSchema, defaultModel } from '..';

export default createSchema({
  dateStart: defaultModel.date,
  dateEnd: defaultModel.date,
  type: defaultModel.string,
  totalPost: defaultModel.number,
  totalView: defaultModel.number,
  totalLike: defaultModel.number,
  totalBookmark: defaultModel.number,
  totalComment: defaultModel.number,
  topVideos: defaultModel.array,
}, 'AmberReport', null, null);
