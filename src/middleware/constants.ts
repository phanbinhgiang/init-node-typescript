import { Request } from 'express';

export const mess500 = 'Unexpected error occurred';
export const mess401 = 'Your request token has expired';
export const mess404 = 'The requested URL was not found on this server.';
export const hashKey = '0xaeb0325a6789f597b4f7c2c4dcb36b1ba4232384ffaf7b24670b71dafc564cec';
export const hashMessage = 'Coin98 Finance is the leading multi-chain wallet and DeFi gateway';
export const baryonMessage = 'Baryon Network | Redefine Your Trading Experience';
export const sarosMessage = 'Saros Finance | A DeFi Super-Network Built on Solana';

export const userAgentWhiteList = ['Coin98', 'okhttp'];

export const dagoraHashMessage = 'DAgora is the leading NFT Marketplace built on BNB Chain';

export const SIGN_MESSAGE_DAPPS = {
  baryon: baryonMessage,
  saros: sarosMessage,
  coin98: hashMessage,
};

export const postStatus = {
  waitingReview: 'waitingReview',
  waitingUpdate: 'waitingUpdate',
  // approved: 'approved',
  // awaiting: 'awaiting',
  updated: 'updated',
  rejected: 'rejected',
  published: 'published',
  scheduled: 'scheduled',
  archived: 'archived',
};

export interface RequestCustom extends Request {
  response : any,
  query: any,
  success?: boolean,
  user?: string,
}

export const userRole = {
  dagora: 'dagora',
  masterStatistical: 'masterStatistical',
  support: 'support',
  reporter: 'reporter',
  masterData: 'masterData',
  admin: 'admin',
  kol: 'kol',
  member: 'member',
  vip: 'vip',
  marketing: 'marketing',
  moderator: 'moderator',
};
