use anchor_lang::prelude::*;

/// Community data structure
#[account]
#[derive(Debug, InitSpace)]
pub struct Community {
    /// The creator of the community
    pub creator: Pubkey,
    /// The name of the community
    #[max_len(50)]
    pub name: String,
    /// The description of the community
    #[max_len(500)]
    pub description: String,
    /// The anime focus of the community
    #[max_len(100)]
    pub anime_focus: String,
    /// The number of members in the community
    pub member_count: u64,
    /// The timestamp when the community was created
    pub created_at: i64,
    /// Whether the community is active
    pub is_active: bool,
}

/// Community membership data structure
#[account]
#[derive(Debug, InitSpace)]
pub struct CommunityMembership {
    /// The user who joined
    pub user: Pubkey,
    /// The community they joined
    pub community: Pubkey,
    /// The timestamp when they joined
    pub joined_at: i64,
    /// Whether the membership is active
    pub is_active: bool,
}

/// Message data structure for decentralized chat
#[account]
#[derive(Debug, InitSpace)]
pub struct MessageData {
    /// The community this message belongs to
    pub community: Pubkey,
    /// The sender of the message
    pub sender: Pubkey,
    /// The content of the message
    #[max_len(1000)]
    pub content: String,
    /// The timestamp when the message was sent
    pub sent_at: i64,
    /// Whether the message is encrypted
    pub is_encrypted: bool,
}
