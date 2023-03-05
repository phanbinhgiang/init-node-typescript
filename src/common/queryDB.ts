import Interaction from '../model/interaction/Interaction';

export default class QueryData {
  static async getReportPostInteractionByType(from, to, value) {
    const data = await Interaction.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(parseInt(from)),
            $lte: new Date(parseInt(to)),
          },
          type: value,
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          total: { $sum: 1 },
        },
      },
    ]);
    return data;
  }
}
