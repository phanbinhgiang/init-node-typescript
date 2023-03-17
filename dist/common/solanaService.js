"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectionSolana = void 0;
/* eslint-disable import/prefer-default-export */
const web3_js_1 = require("@solana/web3.js");
exports.connectionSolana = new web3_js_1.Connection('https://api.devnet.solana.com', 'finalized');
//# sourceMappingURL=solanaService.js.map