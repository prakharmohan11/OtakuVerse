use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint,
    entrypoint::ProgramResult,
    msg,
    program_error::ProgramError,
    pubkey::Pubkey,
    rent::Rent,
    sysvar::Sysvar,
};

// Program entrypoint
entrypoint!(process_instruction);

// Instructions
#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub enum OtakuVerseInstruction {
    /// Initialize NFT marketplace
    InitializeMarketplace,
    /// Mint NFT for watching video
    MintWatchNFT { video_id: String },
    /// Purchase NFT
    PurchaseNFT { nft_id: String, price: u64 },
    /// Join community
    JoinCommunity { community_id: String },
}

// Account data structures
#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct MarketplaceData {
    pub is_initialized: bool,
    pub total_nfts: u64,
    pub total_sales: u64,
}

#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct NFTData {
    pub owner: Pubkey,
    pub video_id: String,
    pub price: u64,
    pub is_for_sale: bool,
    pub mint_timestamp: i64,
}

#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct UserData {
    pub wallet: Pubkey,
    pub nfts_owned: u64,
    pub videos_watched: u64,
    pub communities_joined: Vec<String>,
}

// Program logic
pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    let instruction = OtakuVerseInstruction::try_from_slice(instruction_data)
        .map_err(|_| ProgramError::InvalidInstructionData)?;

    match instruction {
        OtakuVerseInstruction::InitializeMarketplace => {
            msg!("Instruction: Initialize Marketplace");
            initialize_marketplace(accounts, program_id)
        }
        OtakuVerseInstruction::MintWatchNFT { video_id } => {
            msg!("Instruction: Mint Watch NFT for video: {}", video_id);
            mint_watch_nft(accounts, program_id, video_id)
        }
        OtakuVerseInstruction::PurchaseNFT { nft_id, price } => {
            msg!("Instruction: Purchase NFT: {} for {} SOL", nft_id, price);
            purchase_nft(accounts, program_id, nft_id, price)
        }
        OtakuVerseInstruction::JoinCommunity { community_id } => {
            msg!("Instruction: Join Community: {}", community_id);
            join_community(accounts, program_id, community_id)
        }
    }
}

fn initialize_marketplace(accounts: &[AccountInfo], _program_id: &Pubkey) -> ProgramResult {
    let accounts_iter = &mut accounts.iter();
    let marketplace_account = next_account_info(accounts_iter)?;
    let _payer = next_account_info(accounts_iter)?;

    let mut marketplace_data = MarketplaceData::try_from_slice(&marketplace_account.data.borrow())?;
    
    if marketplace_data.is_initialized {
        return Err(ProgramError::AccountAlreadyInitialized);
    }

    marketplace_data.is_initialized = true;
    marketplace_data.total_nfts = 0;
    marketplace_data.total_sales = 0;

    marketplace_data.serialize(&mut &mut marketplace_account.data.borrow_mut()[..])?;
    
    msg!("Marketplace initialized successfully!");
    Ok(())
}

fn mint_watch_nft(accounts: &[AccountInfo], _program_id: &Pubkey, video_id: String) -> ProgramResult {
    let accounts_iter = &mut accounts.iter();
    let nft_account = next_account_info(accounts_iter)?;
    let user_account = next_account_info(accounts_iter)?;
    let marketplace_account = next_account_info(accounts_iter)?;

    // Create NFT data
    let nft_data = NFTData {
        owner: *user_account.key,
        video_id: video_id.clone(),
        price: 0, // Watch NFTs are free
        is_for_sale: false,
        mint_timestamp: 0, // In real implementation, use Clock sysvar
    };

    nft_data.serialize(&mut &mut nft_account.data.borrow_mut()[..])?;

    // Update marketplace stats
    let mut marketplace_data = MarketplaceData::try_from_slice(&marketplace_account.data.borrow())?;
    marketplace_data.total_nfts += 1;
    marketplace_data.serialize(&mut &mut marketplace_account.data.borrow_mut()[..])?;

    msg!("Watch NFT minted for video: {}", video_id);
    Ok(())
}

fn purchase_nft(accounts: &[AccountInfo], _program_id: &Pubkey, _nft_id: String, price: u64) -> ProgramResult {
    let accounts_iter = &mut accounts.iter();
    let nft_account = next_account_info(accounts_iter)?;
    let buyer_account = next_account_info(accounts_iter)?;
    let seller_account = next_account_info(accounts_iter)?;
    let marketplace_account = next_account_info(accounts_iter)?;

    // Update NFT ownership
    let mut nft_data = NFTData::try_from_slice(&nft_account.data.borrow())?;
    nft_data.owner = *buyer_account.key;
    nft_data.is_for_sale = false;
    nft_data.serialize(&mut &mut nft_account.data.borrow_mut()[..])?;

    // Update marketplace stats
    let mut marketplace_data = MarketplaceData::try_from_slice(&marketplace_account.data.borrow())?;
    marketplace_data.total_sales += 1;
    marketplace_data.serialize(&mut &mut marketplace_account.data.borrow_mut()[..])?;

    msg!("NFT purchased for {} SOL", price);
    Ok(())
}

fn join_community(accounts: &[AccountInfo], _program_id: &Pubkey, community_id: String) -> ProgramResult {
    let accounts_iter = &mut accounts.iter();
    let user_account = next_account_info(accounts_iter)?;

    msg!("User joined community: {}", community_id);
    Ok(())
}