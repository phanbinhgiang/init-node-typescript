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
const Post_1 = __importDefault(require("../model/system/Post"));
const Interaction_1 = __importDefault(require("../model/interaction/Interaction"));
const getReportPostInteractionByType = (from, to, value) => __awaiter(void 0, void 0, void 0, function* () {
    const data = yield Interaction_1.default.aggregate([
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
                totalLove: { $sum: 1 },
            },
        },
    ]);
    return data;
});
class QueryData {
    constructor(from, to) {
        this.from = from;
        this.to = to;
    }
    getResPost() {
        return __awaiter(this, void 0, void 0, function* () {
            const groupData = yield Post_1.default.aggregate([
                {
                    $match: {
                        publishDate: {
                            $gte: parseFloat(this.from),
                            $lte: parseFloat(this.to),
                        },
                    },
                },
                {
                    $group: {
                        _id: { $dateToString: { format: '%Y-%m-%d', date: '$updatedAt' } },
                        count: { $sum: 1 },
                    },
                },
            ]);
            // console.log({ groupData });
            return groupData;
        });
    }
    getInteractions() {
        return __awaiter(this, void 0, void 0, function* () {
            const groupDataView = yield Interaction_1.default.aggregate([
                {
                    $match: {
                        createdAt: {
                            $gte: new Date(parseInt(this.from)),
                            $lte: new Date(parseInt(this.to)),
                        },
                        type: 'view',
                    },
                },
                {
                    $group: {
                        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                        totalView: { $sum: { $first: '$relatedID' } },
                    },
                },
            ]);
            const groupDataLove = yield getReportPostInteractionByType(this.from, this.to, 'love');
            const groupDataBookmark = yield getReportPostInteractionByType(this.from, this.to, 'bookmark');
            const groupDataRating = yield getReportPostInteractionByType(this.from, this.to, 'rating');
            return {
                groupDataView,
                groupDataLove,
                groupDataBookmark,
                groupDataRating,
            };
        });
    }
}
exports.default = QueryData;
//# sourceMappingURL=controller.js.map