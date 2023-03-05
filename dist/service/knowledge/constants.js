"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.knowledgeInteractionType = exports.userFilter = exports.genUpdate = exports.knowledgeContentType = void 0;
exports.knowledgeContentType = {
    faq: 'faq',
    article: 'article',
    question: 'question',
};
const genUpdate = (data, arrValue) => {
    const genObject = {};
    arrValue.map((itm) => {
        if (data[itm] !== undefined && data[itm] !== null) {
            genObject[itm] = data[itm];
        }
    });
    return Object.keys(genObject)[0] ? genObject : false;
};
exports.genUpdate = genUpdate;
exports.userFilter = {
    name: 1, userName: 1, image: 1, id: 1, _id: 0,
};
exports.knowledgeInteractionType = {
    bookmark: 'knowledgeBookmark',
    likeComment: 'knowledgeLikeComment',
    vote: 'knowledgeVote',
    view: 'knowledgeView',
};
// export interface FormatKnowledgeTopicType extends KnowledgeTopicType {
//   totalArticle?: number,
// }
//# sourceMappingURL=constants.js.map