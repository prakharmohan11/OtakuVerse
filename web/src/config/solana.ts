/**
 * Solana configuration for OtakuVerse
 */

import { PublicKey, clusterApiUrl } from '@solana/web3.js';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';

// Network configuration
export const NETWORK = WalletAdapterNetwork.Devnet;
export const ENDPOINT = clusterApiUrl(NETWORK);

// Program IDs (will be updated after deployment)
export const OTAKUVERSE_PROGRAM_ID = new PublicKey('6WVQUSeRZPpZDukYxKc1gLjG1hRtUMHCGpvoC7vsEFw1');

// NFT Configuration
export const NFT_CONFIG = {
  // Watch-to-earn NFT pricing (free for watching)
  WATCH_NFT_PRICE: 0,
  
  // Purchasable NFT pricing in SOL
  PURCHASABLE_NFT_PRICES: {
    COMMON: 0.5,
    RARE: 2.0,
    EPIC: 5.0,
    LEGENDARY: 7.5,
  },
  
  // Community membership pricing
  COMMUNITY_MEMBERSHIP_PRICE: 0.1,
};

// Transaction configuration
export const TRANSACTION_CONFIG = {
  COMMITMENT: 'confirmed' as const,
  TIMEOUT: 30000, // 30 seconds
};

// Marketplace configuration
export const MARKETPLACE_CONFIG = {
  FEE_PERCENTAGE: 2.5, // 2.5% marketplace fee
  MIN_PRICE: 0.01, // Minimum NFT price in SOL
  MAX_PRICE: 100, // Maximum NFT price in SOL
};

// Community features
export const COMMUNITY_CONFIG = {
  MAX_MEMBERS: 10000,
  MESSAGE_LIMIT: 100, // Messages per day for free members
  PREMIUM_MESSAGE_LIMIT: 1000, // Messages per day for premium members
};

// Development mode flag
export const IS_DEVELOPMENT = import.meta.env.DEV;

// Explorer URLs
export const EXPLORER_URL = `https://explorer.solana.com/address`;
export const getExplorerUrl = (address: string, cluster: string = 'devnet') => 
  `${EXPLORER_URL}/${address}?cluster=${cluster}`;

// RPC endpoints for fallback
export const RPC_ENDPOINTS = [
  ENDPOINT,
  'https://api.devnet.solana.com',
  'https://devnet.helius-rpc.com/?api-key=demo',
];

export default {
  NETWORK,
  ENDPOINT,
  OTAKUVERSE_PROGRAM_ID,
  NFT_CONFIG,
  TRANSACTION_CONFIG,
  MARKETPLACE_CONFIG,
  COMMUNITY_CONFIG,
  IS_DEVELOPMENT,
  getExplorerUrl,
  RPC_ENDPOINTS,
};