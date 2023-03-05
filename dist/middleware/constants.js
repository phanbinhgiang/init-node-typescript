"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRole = exports.postStatus = exports.SIGN_MESSAGE_DAPPS = exports.dagoraHashMessage = exports.userAgentWhiteList = exports.sarosMessage = exports.baryonMessage = exports.hashMessage = exports.hashKey = exports.mess404 = exports.mess401 = exports.mess500 = void 0;
exports.mess500 = 'Unexpected error occurred';
exports.mess401 = 'Your request token has expired';
exports.mess404 = 'The requested URL was not found on this server.';
exports.hashKey = '0xaeb0325a6789f597b4f7c2c4dcb36b1ba4232384ffaf7b24670b71dafc564cec';
exports.hashMessage = 'Coin98 Finance is the leading multi-chain wallet and DeFi gateway';
exports.baryonMessage = 'Baryon Network | Redefine Your Trading Experience';
exports.sarosMessage = 'Saros Finance | A DeFi Super-Network Built on Solana';
exports.userAgentWhiteList = ['Coin98', 'okhttp'];
exports.dagoraHashMessage = 'DAgora is the leading NFT Marketplace built on BNB Chain';
exports.SIGN_MESSAGE_DAPPS = {
    baryon: exports.baryonMessage,
    saros: exports.sarosMessage,
    coin98: exports.hashMessage,
};
exports.postStatus = {
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
exports.userRole = {
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
//# sourceMappingURL=constants.js.map