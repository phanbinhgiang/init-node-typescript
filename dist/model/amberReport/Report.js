"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("..");
exports.default = (0, __1.createSchema)({
    dateStart: __1.defaultModel.date,
    dateEnd: __1.defaultModel.date,
    type: __1.defaultModel.string,
    totalPost: __1.defaultModel.number,
    totalView: __1.defaultModel.number,
    totalLike: __1.defaultModel.number,
    totalBookmark: __1.defaultModel.number,
    totalComment: __1.defaultModel.number,
    topVideos: __1.defaultModel.array,
}, 'AmberReport', null, null);
//# sourceMappingURL=Report.js.map