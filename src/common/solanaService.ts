/* eslint-disable import/prefer-default-export */
import { Connection } from '@solana/web3.js';

export const connectionSolana = new Connection('https://api.devnet.solana.com', 'finalized');
