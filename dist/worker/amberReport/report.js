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
const dagoraHistory_1 = __importDefault(require("../dagora/dagoraHistory"));
class AmberReportWorker {
    static getAmberReport(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { from, to, type } = req.query;
            const arrQueryTime = dagoraHistory_1.default.QueryTimeArray(from, to, type);
            const dataInteractionPromise = Interaction_1.default.find({
                createdAt: { $gte: arrQueryTime[0].start, $lte: arrQueryTime[arrQueryTime.length - 1].end },
                type: { $in: ['love', 'bookmark', 'rating'] },
            }, 'type createdAt').lean();
            const dataTypeViewPromise = Interaction_1.default.find({
                createdAt: { $gte: arrQueryTime[0].start, $lte: arrQueryTime[arrQueryTime.length - 1].end },
                type: 'view',
            }, 'createdAt relatedID').lean();
            const dataPostPromise = Post_1.default.find({
                createdAt: { $gte: parseFloat(from), $lte: parseFloat(to) },
            }, 'publishDate').lean();
            const [dataInteraction, dataTypeView, dataPost,] = yield Promise.all([dataInteractionPromise, dataTypeViewPromise, dataPostPromise]);
            const getTotalPost = (start, end) => dataPost.filter((item) => item.publishDate >= start.getTime()
                && item.publishDate < end.getTime()).length;
            const getTotalView = (start, end) => dataTypeView.filter((item) => item.createdAt >= start && item.createdAt < end).reduce((total, item) => total + item.relatedID[0], 0);
            const getTotalInteractions = (start, end, typeInteraction) => dataInteraction.filter((item) => typeInteraction
                && item.createdAt >= start
                && item.createdAt < end && item.type === typeInteraction).length;
            const dataResponse = arrQueryTime.map((item) => ({
                dateStart: item.start,
                dateEnd: item.end,
                type,
                totalPost: getTotalPost(item.start, item.end),
                totalView: getTotalView(item.start, item.end),
                totalLove: getTotalInteractions(item.start, item.end, 'love'),
                totalBookmark: getTotalInteractions(item.start, item.end, 'bookmark'),
                totalRating: getTotalInteractions(item.start, item.end, 'rating'),
            }));
            req.response = dataResponse;
            next();
        });
    }
    static postReports(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = req.body;
            // create and update data
            const dataFind = yield Report_1.default.findOne({ dateStart: data.dateStart, dateEnd: data.dateEnd, type: data.type }, '_id');
            if (dataFind === null) {
                yield Report_1.default.create(data);
            }
            else {
                yield dataFind.updateOne(data);
            }
            req.response = true;
            console.log({ header: req.headers });
            next();
        });
    }
}
exports.default = AmberReportWorker;
//# sourceMappingURL=report.js.map