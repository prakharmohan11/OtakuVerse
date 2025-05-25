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

// Define the state stored in accounts
#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct NFTData {
    pub owner: Pubkey,
    pub anime_id: u32,
    pub watch_time: u64,
    pub price: u64,
    pub is_for_sale: bool,
}

#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct CommunityData {
    pub name: String,
    pub member_count: u32,
    pub join_fee: u64,
}

// Define instruction data
#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub enum OtakuVerseInstruction {
    /// Mint an NFT for watching anime
    /// Accounts expected:
    /// 0. `[signer]` The account of the person minting the NFT
    /// 1. `[writable]` The NFT account to be created
    MintWatchNFT { anime_id: u32, watch_time: u64 },
    
    /// Purchase an NFT from marketplace
    /// Accounts expected:
    /// 0. `[signer]` The buyer account
    /// 1. `[writable]` The NFT account
    /// 2. `[writable]` The seller account
    PurchaseNFT { price: u64 },
    
    /// Join a community
    /// Accounts expected:
    /// 0. `[signer]` The user account
    /// 1. `[writable]` The community account
    JoinCommunity { community_id: String },
}

// Declare and export the program's entrypoint
entrypoint!(process_instruction);

// Program entrypoint's implementation
pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    let instruction = OtakuVerseInstruction::try_from_slice(instruction_data)
        .map_err(|_| ProgramError::InvalidInstructionData)?;

    match instruction {
        OtakuVerseInstruction::MintWatchNFT { anime_id, watch_time } => {
            msg!("Instruction: Mint Watch NFT");
            mint_watch_nft(program_id, accounts, anime_id, watch_time)
        }
        OtakuVerseInstruction::PurchaseNFT { price } => {
            msg!("Instruction: Purchase NFT");
            purchase_nft(program_id, accounts, price)
        }
        OtakuVerseInstruction::JoinCommunity { community_id } => {
            msg!("Instruction: Join Community");
            join_community(program_id, accounts, community_id)
        }
    }
}

fn mint_watch_nft(
    _program_id: &Pubkey,
    accounts: &[AccountInfo],
    anime_id: u32,
    watch_time: u64,
) -> ProgramResult {
    let accounts_iter = &mut accounts.iter();
    let user_account = next_account_info(accounts_iter)?;
    let nft_account = next_account_info(accounts_iter)?;

    if !user_account.is_signer {
        return Err(ProgramError::MissingRequiredSignature);
    }

    let nft_data = NFTData {
        owner: *user_account.key,
        anime_id,
        watch_time,
        price: 0,
        is_for_sale: false,
    };

    nft_data.serialize(&mut &mut nft_account.data.borrow_mut()[..])?;

    msg!("NFT minted for anime {} with {} minutes watched", anime_id, watch_time);
    Ok(())
}

fn purchase_nft(
    _program_id: &Pubkey,
    accounts: &[AccountInfo],
    price: u64,
) -> ProgramResult {
    let accounts_iter = &mut accounts.iter();
    let buyer_account = next_account_info(accounts_iter)?;
    let nft_account = next_account_info(accounts_iter)?;
    let seller_account = next_account_info(accounts_iter)?;

    if !buyer_account.is_signer {
        return Err(ProgramError::MissingRequiredSignature);
    }

    let mut nft_data = NFTData::try_from_slice(&nft_account.data.borrow())?;
    
    if !nft_data.is_for_sale {
        return Err(ProgramError::InvalidAccountData);
    }

    if nft_data.price != price {
        return Err(ProgramError::InvalidArgument);
    }

    // Transfer ownership
    nft_data.owner = *buyer_account.key;
    nft_data.is_for_sale = false;
    nft_data.serialize(&mut &mut nft_account.data.borrow_mut()[..])?;

    // Transfer SOL (simplified - in real implementation would use proper SOL transfer)
    **buyer_account.try_borrow_mut_lamports()? -= price;
    **seller_account.try_borrow_mut_lamports()? += price;

    msg!("NFT purchased for {} lamports", price);
    Ok(())
}

fn join_community(
    _program_id: &Pubkey,
    accounts: &[AccountInfo],
    community_id: String,
) -> ProgramResult {
    let accounts_iter = &mut accounts.iter();
    let user_account = next_account_info(accounts_iter)?;
    let community_account = next_account_info(accounts_iter)?;

    if !user_account.is_signer {
        return Err(ProgramError::MissingRequiredSignature);
    }

    let mut community_data = CommunityData::try_from_slice(&community_account.data.borrow())
        .unwrap_or(CommunityData {
            name: community_id.clone(),
            member_count: 0,
            join_fee: 1000000, // 0.001 SOL
        });

    community_data.member_count += 1;
    community_data.serialize(&mut &mut community_account.data.borrow_mut()[..])?;

    msg!("User joined community: {}", community_id);
    Ok(())
}