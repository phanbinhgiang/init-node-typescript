export interface DappsType {
  _id: any,
  slug?: string,
  title?: string,
  description?: string,
  descriptionMobile?: string,
  logo?: string,
  banner?: [],
  bannerMobile?: [],
  url?: string,
  genre?: [],

  cgkId?: string,
  chain?: [],
  isPinned?: boolean,
  weight?: number,
  tags?: [],
  social?: object,
  isActive?: boolean,
  view?: number,
}

export interface GenreType {
  _id: any,
  slug?: string,
  title?: string,
  description?: string,
  logo?: string,
  banner?: [],
  isPinned?: boolean,
  weight?: number,
  tags?: [],
  isActive?: boolean,
  createdUser?: string,
  source?: string,
}

export interface ArrViewType {
  _id: string, view: number
}
