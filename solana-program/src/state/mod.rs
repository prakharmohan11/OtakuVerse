pub mod nft;
pub mod community;

pub use nft::*;
pub use community::*;

use anchor_lang::prelude::*;

/// Platform-wide state
#[account]
#[derive(InitSpace)]
pub struct PlatformState {
    /// Authority that can manage the platform
    pub authority: Pubkey,
    /// Total number of NFTs created
    pub total_nfts: u64,
    /// Total number of communities created
    pub total_communities: u64,
    /// Platform fee in basis points (e.g., 250 = 2.5%)
    pub platform_fee_basis_points: u16,
    /// Bump seed for PDA
    pub bump: u8,
}

/// User statistics for tracking watch time and rewards
#[account]
#[derive(InitSpace)]
pub struct UserStats {
    /// User's public key
    pub user: Pubkey,
    /// Total watch time in minutes
    pub total_watch_time: u64,
    /// Number of NFTs earned through watching
    pub nfts_earned: u64,
    /// Last reward timestamp
    pub last_reward_at: i64,
}
