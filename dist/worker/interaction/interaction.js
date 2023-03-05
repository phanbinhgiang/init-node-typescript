// import ReportWorker from '../amberReport/report';
// export default class InteractionWorker {
//   static async getView(req, res, next) {
//     const {
//       from, to,
//     } = req.query;
// const dataRes = await Interaction.find({
//   createdAt: {
//     $gte: new Date(1672671600000),
//     $lte: new Date(1672803323000),
//   },
//   type: 'view',
// });
// const groupDataView = await Interaction.aggregate([
//   {
//     $match: {
//       createdAt: {
//         $gte: new Date(parseInt(from)),
//         $lte: new Date(parseInt(to)),
//       },
//       type: 'view',
//     },
//   },
//   {
//     $group: {
//       _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
//       totalView: { $sum: { $first: '$relatedID' } },
//     },
//   },
// ]);
// const groupDataLove = await Interaction.aggregate([
//   {
//     $match: {
//       createdAt: {
//         $gte: new Date(parseInt(from)),
//         $lte: new Date(parseInt(to)),
//       },
//       type: 'love',
//     },
//   },
//   {
//     $group: {
//       _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
//       totalView: { $sum: 1 },
//     },
//   },
// ]);
// const groupDataBookmark = await Interaction.aggregate([
//   {
//     $match: {
//       createdAt: {
//         $gte: new Date(parseInt(from)),
//         $lte: new Date(parseInt(to)),
//       },
//       type: 'bookmark',
//     },
//   },
//   {
//     $group: {
//       _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
//       totalView: { $sum: 1 },
//     },
//   },
// ]);
// const groupDataRating = await Interaction.aggregate([
//   {
//     $match: {
//       createdAt: {
//         $gte: new Date(parseInt(from)),
//         $lte: new Date(parseInt(to)),
//       },
//       type: 'rating',
//     },
//   },
//   {
//     $group: {
//       _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
//       totalView: { $sum: 1 },
//     },
//   },
// ]);
//     const {
//       groupDataView,
//       groupDataLove,
//       groupDataBookmark,
//       groupDataRating,
//     } = await ReportWorker.getReportPostInteractions(from, to);
//     req.response = {
//       view: groupDataView,
//       love: groupDataLove,
//       bookmark: groupDataBookmark,
//       rating: groupDataRating,
//     };
//     next();
//   }
// }
//# sourceMappingURL=interaction.js.map