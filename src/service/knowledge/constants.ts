/* eslint-disable array-callback-return */
/* eslint-disable import/prefer-default-export */
import { ObjectId } from 'mongoose';

export const knowledgeContentType = {
  faq: 'faq',
  article: 'article',
  question: 'question',
};

export const genUpdate = (data, arrValue) => {
  const genObject = {};
  arrValue.map((itm) => {
    if (data[itm] !== undefined && data[itm] !== null) {
      genObject[itm] = data[itm];
    }
  });
  return Object.keys(genObject)[0] ? genObject : false;
};

export const userFilter = {
  name: 1, userName: 1, image: 1, id: 1, _id: 0,
};

export const knowledgeInteractionType = {
  bookmark: 'knowledgeBookmark',
  likeComment: 'knowledgeLikeComment',
  vote: 'knowledgeVote',
  view: 'knowledgeView',
};

export interface UserType {
  _id: any,
  id?: string,
  name?: string,
  refId?: string,
  userNameProfile?: string,
  image?: string,
}

export interface KnowledgeContentType<T> {
  _id: any,
  id?: string,
  title?: string,
  author?: T,
  description?: string,
  content?: string,
  topic?: string,
  category?: string,
  type?: string, // defind type of content article, FAQs, Questions
  image?: string,
  isActive?: boolean,
  totalComment?: number,
  totalVote?: number;
  totalBookmark?: number;
  totalView?: number;
}

export interface KnowledgeCommentType {
  _id: ObjectId,
  id?: string, // questionId
  fatherId?: string,
  content?: string,
  author?: string,
  image?: string,
  isActive?: boolean,
}

export interface InteractionType {
  _id: any,
  id?: string, // postID || cmt id (type= like)
  type?: string,
  reUpdatedList?: any, // tracking User Interaction
  relatedID?: any, // user ID
  isActive?: boolean,
  locale?: string,
  orgID?: string,
  info?: { mode: string, font: any },
  createdAt?: Date,
}

export interface MatchStateType {
  id?: string,
  type?: string,
  createdAt?: {
    $gte: Date,
    $lte: Date,
  },
  title?: object,
  topic?: string,
  isActive?: boolean,
  category?: string,
  fatherId?: string,
  chain?: string,
  genre?:string | { $in: string[] },
  slug?: { $nin: string[] },
  isPinned?: boolean,
}

export interface KnowledgeTopicType {
  _id: any,
  id?: string,
  title?: string,
  author?: any,
  category?: [
    {
      _id: any,
      title: string,
    },
  ],
  image?: string,
  description?: string,
  isActive?: boolean,
  totalArticle?: number,
}

// export interface FormatKnowledgeTopicType extends KnowledgeTopicType {
//   totalArticle?: number,
// }
