/**
 * Solana service for OtakuVerse blockchain interactions
 */

import { 
  Connection, 
  PublicKey, 
  Transaction, 
  SystemProgram,
  LAMPORTS_PER_SOL,
  TransactionInstruction,
  sendAndConfirmTransaction,
  Keypair
} from '@solana/web3.js';
import { 
  ENDPOINT, 
  OTAKUVERSE_PROGRAM_ID, 
  NFT_CONFIG, 
  TRANSACTION_CONFIG,
  getExplorerUrl 
} from '@/config/solana';

export class SolanaService {
  private connection: Connection;

  constructor() {
    this.connection = new Connection(ENDPOINT, TRANSACTION_CONFIG.COMMITMENT);
  }

  /**
   * Get SOL balance for a wallet
   */
  async getBalance(publicKey: PublicKey): Promise<number> {
    try {
      const balance = await this.connection.getBalance(publicKey);
      return balance / LAMPORTS_PER_SOL;
    } catch (error) {
      console.error('Error getting balance:', error);
      return 0;
    }
  }

  /**
   * Transfer SOL between wallets
   */
  async transferSOL(
    fromWallet: any,
    toPublicKey: PublicKey,
    amount: number
  ): Promise<string | null> {
    try {
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: fromWallet.publicKey,
          toPubkey: toPublicKey,
          lamports: amount * LAMPORTS_PER_SOL,
        })
      );

      const signature = await fromWallet.sendTransaction(transaction, this.connection);
      await this.connection.confirmTransaction(signature);
      
      return signature;
    } catch (error) {
      console.error('Error transferring SOL:', error);
      return null;
    }
  }

  /**
   * Mint a watch-to-earn NFT
   */
  async mintWatchNFT(
    wallet: any,
    videoId: string
  ): Promise<{ success: boolean; signature?: string; error?: string }> {
    try {
      // Create instruction data for minting watch NFT
      const instructionData = Buffer.from([
        1, // Instruction index for MintWatchNFT
        ...Buffer.from(videoId, 'utf8')
      ]);

      const instruction = new TransactionInstruction({
        keys: [
          { pubkey: wallet.publicKey, isSigner: true, isWritable: true },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        ],
        programId: OTAKUVERSE_PROGRAM_ID,
        data: instructionData,
      });

      const transaction = new Transaction().add(instruction);
      const signature = await wallet.sendTransaction(transaction, this.connection);
      await this.connection.confirmTransaction(signature);

      return { 
        success: true, 
        signature,
      };
    } catch (error) {
      console.error('Error minting watch NFT:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Purchase an NFT from the marketplace
   */
  async purchaseNFT(
    wallet: any,
    nftId: string,
    price: number,
    sellerPublicKey: PublicKey
  ): Promise<{ success: boolean; signature?: string; error?: string }> {
    try {
      // First transfer SOL to seller
      const transferSignature = await this.transferSOL(wallet, sellerPublicKey, price);
      if (!transferSignature) {
        throw new Error('Failed to transfer payment');
      }

      // Create instruction data for purchasing NFT
      const instructionData = Buffer.from([
        2, // Instruction index for PurchaseNFT
        ...Buffer.from(nftId, 'utf8'),
        ...Buffer.from(price.toString(), 'utf8')
      ]);

      const instruction = new TransactionInstruction({
        keys: [
          { pubkey: wallet.publicKey, isSigner: true, isWritable: true },
          { pubkey: sellerPublicKey, isSigner: false, isWritable: true },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        ],
        programId: OTAKUVERSE_PROGRAM_ID,
        data: instructionData,
      });

      const transaction = new Transaction().add(instruction);
      const signature = await wallet.sendTransaction(transaction, this.connection);
      await this.connection.confirmTransaction(signature);

      return { 
        success: true, 
        signature,
      };
    } catch (error) {
      console.error('Error purchasing NFT:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Join a community (requires payment)
   */
  async joinCommunity(
    wallet: any,
    communityId: string,
    membershipPrice: number = NFT_CONFIG.COMMUNITY_MEMBERSHIP_PRICE
  ): Promise<{ success: boolean; signature?: string; error?: string }> {
    try {
      // Create instruction data for joining community
      const instructionData = Buffer.from([
        3, // Instruction index for JoinCommunity
        ...Buffer.from(communityId, 'utf8')
      ]);

      const instruction = new TransactionInstruction({
        keys: [
          { pubkey: wallet.publicKey, isSigner: true, isWritable: true },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        ],
        programId: OTAKUVERSE_PROGRAM_ID,
        data: instructionData,
      });

      const transaction = new Transaction().add(instruction);
      const signature = await wallet.sendTransaction(transaction, this.connection);
      await this.connection.confirmTransaction(signature);

      return { 
        success: true, 
        signature,
      };
    } catch (error) {
      console.error('Error joining community:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Get transaction details
   */
  async getTransaction(signature: string) {
    try {
      return await this.connection.getTransaction(signature);
    } catch (error) {
      console.error('Error getting transaction:', error);
      return null;
    }
  }

  /**
   * Get explorer URL for a transaction
   */
  getTransactionUrl(signature: string): string {
    return getExplorerUrl(signature, 'devnet');
  }

  /**
   * Validate if an address is a valid Solana public key
   */
  isValidPublicKey(address: string): boolean {
    try {
      new PublicKey(address);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Request airdrop for testing (devnet only)
   */
  async requestAirdrop(publicKey: PublicKey, amount: number = 1): Promise<string | null> {
    try {
      const signature = await this.connection.requestAirdrop(
        publicKey,
        amount * LAMPORTS_PER_SOL
      );
      await this.connection.confirmTransaction(signature);
      return signature;
    } catch (error) {
      console.error('Error requesting airdrop:', error);
      return null;
    }
  }
}

// Export singleton instance
export const solanaService = new SolanaService();
export default solanaService;