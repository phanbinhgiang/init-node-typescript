"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Report_1 = __importDefault(require("../../model/amberReport/Report"));
const Post_1 = __importDefault(require("../../model/system/Post"));
const Interaction_1 = __importDefault(require("../../model/interaction/Interaction"));
const index_1 = require("../function/index");
class AmberReportWorker {
    static getAmberReport(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { from, to, type } = req.query;
            const arrQueryTime = (0, index_1.getQueryTimeArray)(from, to, type);
            const dataInteractionPromise = Interaction_1.default.find({
                createdAt: { $gte: arrQueryTime[0].start, $lte: arrQueryTime[arrQueryTime.length - 1].end },
                type: { $in: ['love', 'bookmark', 'rating', 'tracking'] },
                isActive: true,
            }, 'type createdAt info').lean();
            const dataTypeViewPromise = Interaction_1.default.find({
                createdAt: { $gte: arrQueryTime[0].start, $lte: arrQueryTime[arrQueryTime.length - 1].end },
                type: 'view',
            }, 'createdAt relatedID').lean();
            const dataPostPromise = Post_1.default.find({
                publishDate: {
                    $gte: arrQueryTime[0].start.getTime(),
                    $lte: arrQueryTime[arrQueryTime.length - 1].end.getTime(),
                },
            }, 'publishDate').lean();
            const dataTopVideosPromise = Post_1.default.aggregate([
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
            const [dataInteraction, dataTypeView, dataPost, dataTopVideos,] = yield Promise.all([
                dataInteractionPromise,
                dataTypeViewPromise,
                dataPostPromise,
                dataTopVideosPromise,
            ]);
            const getTotalPost = (start, end) => dataPost.filter((item) => item.publishDate >= start.getTime() && item.publishDate < end.getTime()).length;
            const getTotalView = (start, end) => dataTypeView.filter((item) => item.createdAt >= start && item.createdAt < end).reduce((total, item) => total + item.relatedID[0], 0);
            const getTotalInteractions = (start, end, typeInteraction) => dataInteraction.filter((item) => item.createdAt >= start
                && item.createdAt < end && item.type === typeInteraction).length;
            const getTopVideos = (start, end) => dataTopVideos.filter((item) => item.publishDate >= start.getTime() && item.publishDate < end.getTime()).map((item) => {
                var _a;
                return ({
                    title: item.title,
                    youtubeUrl: item.youtubeUrl,
                    views: ((_a = item.view[0]) === null || _a === void 0 ? void 0 : _a.count) || 0,
                });
            }).sort((a, b) => b.views - a.views);
            const getInfoTrackings = (start, end) => dataInteraction.filter((item) => item.createdAt >= start && item.createdAt < end && item.type === 'tracking');
            const dataResponse = arrQueryTime.map((item) => ({
                dateStart: item.start,
                dateEnd: item.end,
                type,
                totalPost: getTotalPost(item.start, item.end),
                totalView: getTotalView(item.start, item.end),
                totalLike: getTotalInteractions(item.start, item.end, 'love'),
                totalBookmark: getTotalInteractions(item.start, item.end, 'bookmark'),
                totalComment: getTotalInteractions(item.start, item.end, 'rating'),
                topVideos: getTopVideos(item.start, item.end),
                theme: {
                    light: getInfoTrackings(item.start, item.end).filter((index) => index.info.mode === 'light').length,
                    dark: getInfoTrackings(item.start, item.end).filter((index) => index.info.mode === 'dark').length,
                },
                font: {
                    IBM: getInfoTrackings(item.start, item.end).filter((index) => { var _a; return (index.info.font === 'ibm-plex-sans' || ((_a = index.info.font) === null || _a === void 0 ? void 0 : _a.key) === 'ibm-plex-sans'); }).length,
                    Bookerly: getInfoTrackings(item.start, item.end).filter((index) => { var _a; return (index.info.font === 'bookerly' || ((_a = index.info.font) === null || _a === void 0 ? void 0 : _a.key) === 'bookerly'); }).length,
                    NotoSerif: getInfoTrackings(item.start, item.end).filter((index) => { var _a; return (index.info.font === 'notoserif' || ((_a = index.info.font) === null || _a === void 0 ? void 0 : _a.key) === 'notoserif'); }).length,
                    Roboto: getInfoTrackings(item.start, item.end).filter((index) => { var _a; return (index.info.font === 'roboto' || ((_a = index.info.font) === null || _a === void 0 ? void 0 : _a.key) === 'roboto'); }).length,
                    Lora: getInfoTrackings(item.start, item.end).filter((index) => { var _a; return (index.info.font === 'lora' || ((_a = index.info.font) === null || _a === void 0 ? void 0 : _a.key) === 'lora'); }).length,
                },
                // font: Object.values(getInfoTrackings(item.start, item.end).reduce((acc, index) => {
                //   const { info } = index;
                //   const font = info.font?.key || info.font;
                //   acc[font] = { font, amount: (acc[font]?.amount || 0) + 1 };
                //   return acc;
                // }, {})).sort((a, b) => b.amount - a.amount),
            }));
            dataResponse.forEach((item) => __awaiter(this, void 0, void 0, function* () {
                yield AmberReportWorker.postReports(item);
            }));
            req.response = dataResponse;
            next();
        });
    }
    static postReports(data) {
        return __awaiter(this, void 0, void 0, function* () {
            // create and update data
            const dataFind = yield Report_1.default.findOne({ dateStart: data.dateStart, dateEnd: data.dateEnd, type: data.type }, '_id');
            if (dataFind === null) {
                yield Report_1.default.create(data);
            }
            else {
                yield dataFind.updateOne(data);
            }
        });
    }
}
exports.default = AmberReportWorker;
//# sourceMappingURL=amberReport.js.map