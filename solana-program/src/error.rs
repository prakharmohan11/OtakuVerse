use anchor_lang::prelude::*;

/// Custom errors for the OtakuVerse program
#[error_code]
pub enum OtakuVerseError {
    /// Invalid instruction data passed
    #[msg("Invalid instruction data")]
    InvalidInstructionData,

    /// Not enough SOL to purchase NFT
    #[msg("Insufficient funds for purchase")]
    InsufficientFunds,

    /// User doesn't have permission
    #[msg("Unauthorized access")]
    Unauthorized,

    /// NFT already minted
    #[msg("NFT already exists")]
    NFTAlreadyExists,

    /// NFT not found
    #[msg("NFT not found")]
    NFTNotFound,

    /// Invalid NFT metadata
    #[msg("Invalid NFT metadata")]
    InvalidNFTMetadata,

    /// Invalid message data
    #[msg("Invalid message data")]
    InvalidMessageData,

    /// Community not found
    #[msg("Community not found")]
    CommunityNotFound,

    /// Name is too long
    #[msg("Name is too long")]
    NameTooLong,

    /// Symbol is too long
    #[msg("Symbol is too long")]
    SymbolTooLong,

    /// URI is too long
    #[msg("URI is too long")]
    UriTooLong,

    /// Description is too long
    #[msg("Description is too long")]
    DescriptionTooLong,

    /// Invalid royalty percentage
    #[msg("Invalid royalty percentage")]
    InvalidRoyalty,

    /// NFT is not for sale
    #[msg("NFT is not for sale")]
    NFTNotForSale,

    /// Cannot buy your own NFT
    #[msg("Cannot buy your own NFT")]
    CannotBuyOwnNFT,

    /// Insufficient watch time for reward
    #[msg("Insufficient watch time for reward")]
    InsufficientWatchTime,

    /// Invalid price
    #[msg("Invalid price")]
    InvalidPrice,

    /// Already a member of this community
    #[msg("Already a member of this community")]
    AlreadyMember,

    /// Not a member of this community
    #[msg("Not a member of this community")]
    NotMember,

    /// Message content is too long
    #[msg("Message content is too long")]
    MessageTooLong,

    /// Invalid collection
    #[msg("Invalid collection")]
    InvalidCollection,

    /// NFT transfer failed
    #[msg("NFT transfer failed")]
    TransferFailed,
}
