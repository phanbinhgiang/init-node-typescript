import { Response, NextFunction } from 'express';
import AmberReport from '../../model/amberReport/Report';
import Post from '../../model/system/Post';
import Interaction from '../../model/interaction/Interaction';
import { DurationTime } from '../dagora/dagoraHistory';
import { RequestCustom } from '../../middleware/constants';
import { AmberHistoryType, PostType } from '../../service/amberReport/constants';
import { getQueryTimeArray } from '../function/index';
import { InteractionType } from '../../service/knowledge/constants';

export default class AmberReportWorker {
  static async getAmberReport(req: RequestCustom, res: Response, next: NextFunction) {
    const { from, to, type } = req.query;
    const arrQueryTime: DurationTime[] = getQueryTimeArray(from, to, type);
    const dataInteractionPromise = Interaction.find({
      createdAt: { $gte: arrQueryTime[0].start, $lte: arrQueryTime[arrQueryTime.length - 1].end },
      type: { $in: ['love', 'bookmark', 'rating', 'tracking'] },
      isActive: true,
    }, 'type createdAt info').lean();

    const dataTypeViewPromise = Interaction.find({
      createdAt: { $gte: arrQueryTime[0].start, $lte: arrQueryTime[arrQueryTime.length - 1].end },
      type: 'view',
    }, 'createdAt relatedID').lean();

    const dataPostPromise = Post.find({
      publishDate: {
        $gte: arrQueryTime[0].start.getTime(),
        $lte: arrQueryTime[arrQueryTime.length - 1].end.getTime(),
      },
    }, 'publishDate').lean();

    const dataTopVideosPromise = Post.aggregate([
      {
        $match: {
          publishDate: {
            $gte: arrQueryTime[0].start.getTime(),
            $lte: arrQueryTime[arrQueryTime.length - 1].end.getTime(),
          },
          youtubeUrl: { $exists: true, $ne: '' },
        },
      },
      {
        $project: {
          _id: 1,
          publishDate: 1,
          youtubeUrl: 1,
          title: 1,
        },
      },
      {
        $lookup: {
          from: 'interactions',
          let: { refId: '$_id' },
          pipeline: [
            {
              $match: {
                createdAt: {
                  $gte: arrQueryTime[0].start,
                  $lte: arrQueryTime[arrQueryTime.length - 1].end,
                },
                type: 'view',
                $expr: { $eq: ['$id', { $toString: '$$refId' }] },
              },
            },
            {
              $group: {
                _id: null,
                count: { $sum: { $first: '$relatedID' } },
              },
            },
          ],
          as: 'view',
        },
      },
    ]);

    const [
      dataInteraction,
      dataTypeView,
      dataPost,
      dataTopVideos,
    ] = await Promise.all([
      dataInteractionPromise,
      dataTypeViewPromise,
      dataPostPromise,
      dataTopVideosPromise,
    ]);

    const getTotalPost = (start: Date, end: Date): number => dataPost.filter(
      (item: PostType) => item.publishDate >= start.getTime() && item.publishDate < end.getTime(),
    ).length;

    const getTotalView = (start: Date, end: Date): number => dataTypeView.filter(
      (item: InteractionType) => item.createdAt >= start && item.createdAt < end,
    ).reduce((total, item: InteractionType) => total + item.relatedID[0], 0);

    const getTotalInteractions = (
      start: Date,
      end: Date,
      typeInteraction: string,
    ): number => dataInteraction.filter(
      (item: InteractionType) => item.createdAt >= start
      && item.createdAt < end && item.type === typeInteraction,
    ).length;

    const getTopVideos = (start: Date, end: Date): {
      title: string, youtubeUrl: string, views: number
    }[] => dataTopVideos.filter(
      (item: PostType) => item.publishDate >= start.getTime() && item.publishDate < end.getTime(),
    ).map((item: PostType) => ({
      title: item.title,
      youtubeUrl: item.youtubeUrl,
      views: item.view[0]?.count || 0,
    })).sort((a, b) => b.views - a.views);

    const getInfoTrackings = (start: Date, end: Date): InteractionType[] => dataInteraction.filter(
      (item: InteractionType) => item.createdAt >= start && item.createdAt < end && item.type === 'tracking',
    );

    const dataResponse: AmberHistoryType[] = arrQueryTime.map((item) => (
      {
        dateStart: item.start,
        dateEnd: item.end,
        type,
        totalPost: getTotalPost(item.start, item.end),
        totalView: getTotalView(item.start, item.end),
        totalLike: getTotalInteractions(item.start, item.end, 'love'), // isActive: true
        totalBookmark: getTotalInteractions(item.start, item.end, 'bookmark'), // isActive: true
        totalComment: getTotalInteractions(item.start, item.end, 'rating'), // isActive: true
        topVideos: getTopVideos(item.start, item.end),
        theme: {
          light: getInfoTrackings(item.start, item.end).filter((index) => index.info.mode === 'light').length,
          dark: getInfoTrackings(item.start, item.end).filter((index) => index.info.mode === 'dark').length,
        },
        font: {
          IBM: getInfoTrackings(item.start, item.end).filter((index) => (index.info.font === 'ibm-plex-sans' || index.info.font?.key === 'ibm-plex-sans')).length,
          Bookerly: getInfoTrackings(item.start, item.end).filter((index) => (index.info.font === 'bookerly' || index.info.font?.key === 'bookerly')).length,
          NotoSerif: getInfoTrackings(item.start, item.end).filter((index) => (index.info.font === 'notoserif' || index.info.font?.key === 'notoserif')).length,
          Roboto: getInfoTrackings(item.start, item.end).filter((index) => (index.info.font === 'roboto' || index.info.font?.key === 'roboto')).length,
          Lora: getInfoTrackings(item.start, item.end).filter((index) => (index.info.font === 'lora' || index.info.font?.key === 'lora')).length,
        },
        // font: Object.values(getInfoTrackings(item.start, item.end).reduce((acc, index) => {
        //   const { info } = index;
        //   const font = info.font?.key || info.font;
        //   acc[font] = { font, amount: (acc[font]?.amount || 0) + 1 };
        //   return acc;
        // }, {})).sort((a, b) => b.amount - a.amount),
      }
    ));
    dataResponse.forEach(async (item) => {
      await AmberReportWorker.postReports(item);
    });

    req.response = dataResponse;
    next();
  }

  static async postReports(data: AmberHistoryType) {
    // create and update data
    const dataFind = await AmberReport.findOne({ dateStart: data.dateStart, dateEnd: data.dateEnd, type: data.type }, '_id');
    if (dataFind === null) {
      await AmberReport.create(data);
    } else {
      await dataFind.updateOne(data);
    }
  }
}
