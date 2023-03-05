export interface AmberHistoryType {
  dateStart: Date,
  dateEnd: Date,
  type: string,
  totalPost: number,
  totalView: number,
  totalLike: number,
  totalBookmark: number,
  totalComment: number,
  topVideos: { title: string, youtubeUrl: string, views: number }[],
  theme: { light: number, dark: number },
  font: { IBM: number, Bookerly: number, NotoSerif: number, Roboto: number, Lora: number },
}

export interface PostType {
   // Core fields
   _id: any,
   slug?: string, // Link params on website
   title?: string,
   image?: {
     dark: String, light: String, darkColor: String, lightColor: String,
   },
   cover?: {
     dark: String, light: String, darkColor: String, lightColor: String,
   },
   description?: string,
   content?: string,
   note?: string,
   displayType?: string,
   status?: string,
   publishDate?: number,
   blockContent?: object,
   // SEO fields
   seoTitle?: string,
   seoDescription?: string,
   seoKeyword?: string,
   seoImage?: string,
   seoslug?: string,
   altImage?: string,
   // Support fields
   relatedID?: string,
   isActive?: boolean,
   createdAt?: Date,
   updatedList?: any,
   lang?: { type: String, default: 'gb' },
   selectedTokens?: [
     {
       id: string,
     },
   ], // [{id},{id}] id = cgkId
   universalLink?: string,
   // Join from tags collection
   tags?: any,
   // Join from user collection
   author?: string,
   designer?: string,
   // join post difficulty collection
   interactionLevel?: string,
   showDisclaimer?: boolean,
   // pdf link
   pdfContent?: string,

   orgKey?: string,
   domain?: string,
   // youtube link
   youtubeUrl?: string,
   videoDuration?: number,

   // background color
   backgroundColor?: string,
   view?: any,
}
