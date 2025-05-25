
/**
 * Wallet utility functions for Otakuverse
 * Handles Phantom and Backpack wallet connections
 */

import { PublicKey, Transaction, Connection, clusterApiUrl } from '@solana/web3.js';

// Types for wallet interactions
export interface WalletInfo {
  name: string;
  publicKey: string;
  isConnected: boolean;
}

// Extend window interface for wallet providers
declare global {
  interface Window {
    solana?: {
      isPhantom?: boolean;
      connect: () => Promise<{ publicKey: PublicKey }>;
      disconnect: () => Promise<void>;
      signTransaction: (transaction: Transaction) => Promise<Transaction>;
      signAllTransactions: (transactions: Transaction[]) => Promise<Transaction[]>;
      publicKey: PublicKey | null;
      isConnected: boolean;
    };
    backpack?: {
      isBackpack?: boolean;
      connect: () => Promise<{ publicKey: PublicKey }>;
      disconnect: () => Promise<void>;
      signTransaction: (transaction: Transaction) => Promise<Transaction>;
      signAllTransactions: (transactions: Transaction[]) => Promise<Transaction[]>;
      publicKey: PublicKey | null;
      isConnected: boolean;
    };
  }
}

// Check if Phantom wallet is available
export const isPhantomAvailable = (): boolean => {
  return typeof window !== 'undefined' && window.solana?.isPhantom === true;
};

// Check if Backpack wallet is available
export const isBackpackAvailable = (): boolean => {
  return typeof window !== 'undefined' && window.backpack?.isBackpack === true;
};

// Connect to Phantom wallet
export const connectPhantom = async (): Promise<WalletInfo | null> => {
  try {
    if (!isPhantomAvailable()) {
      window.open('https://phantom.app/', '_blank');
      return null;
    }

    const provider = window.solana;
    if (!provider) return null;

    const response = await provider.connect();
    const publicKey = response.publicKey.toString();

    return {
      name: 'Phantom',
      publicKey: publicKey,
      isConnected: true
    };
  } catch (error) {
    console.error('Error connecting to Phantom wallet:', error);
    return null;
  }
};

// Connect to Backpack wallet
export const connectBackpack = async (): Promise<WalletInfo | null> => {
  try {
    if (!isBackpackAvailable()) {
      window.open('https://www.backpack.app/', '_blank');
      return null;
    }

    const provider = window.backpack;
    if (!provider) return null;

    const response = await provider.connect();
    const publicKey = response.publicKey.toString();

    return {
      name: 'Backpack',
      publicKey: publicKey,
      isConnected: true
    };
  } catch (error) {
    console.error('Error connecting to Backpack wallet:', error);
    return null;
  }
};

// Disconnect from wallet
export const disconnectWallet = async (walletName: string): Promise<boolean> => {
  try {
    if (walletName === 'Phantom' && isPhantomAvailable()) {
      await window.solana?.disconnect();
      return true;
    } 
    
    if (walletName === 'Backpack' && isBackpackAvailable()) {
      await window.backpack?.disconnect();
      return true;
    }

    return false;
  } catch (error) {
    console.error(`Error disconnecting from ${walletName} wallet:`, error);
    return false;
  }
};

// Get current wallet connection status
export const getWalletStatus = (): { isConnected: boolean; publicKey: string | null; walletName: string | null } => {
  if (isPhantomAvailable() && window.solana?.isConnected && window.solana?.publicKey) {
    return {
      isConnected: true,
      publicKey: window.solana.publicKey.toString(),
      walletName: 'Phantom'
    };
  }
  
  if (isBackpackAvailable() && window.backpack?.isConnected && window.backpack?.publicKey) {
    return {
      isConnected: true,
      publicKey: window.backpack.publicKey.toString(),
      walletName: 'Backpack'
    };
  }

  return {
    isConnected: false,
    publicKey: null,
    walletName: null
  };
};

// Create Solana connection
export const createConnection = (): Connection => {
  return new Connection(clusterApiUrl('devnet'), 'confirmed');
};

// Format wallet address for display
export const formatWalletAddress = (address: string, chars: number = 4): string => {
  if (!address) return '';
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
};

// Validate Solana address
export const isValidSolanaAddress = (address: string): boolean => {
  try {
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
};
