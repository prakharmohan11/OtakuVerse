use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{self, Mint, Token, TokenAccount, Transfer},
};

declare_id!("6WVQUSeRZPpZDukYxKc1gLjG1hRtUMHCGpvoC7vsEFw1");

pub mod state;
pub mod error;
pub mod instruction;

use state::*;
use error::*;

#[program]
pub mod otakuverse_program {
    use super::*;

    /// Initialize the OtakuVerse program
    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let platform_state = &mut ctx.accounts.platform_state;
        platform_state.authority = ctx.accounts.authority.key();
        platform_state.total_nfts = 0;
        platform_state.total_communities = 0;
        platform_state.platform_fee_basis_points = 250; // 2.5%
        platform_state.bump = ctx.bumps.platform_state;
        
        msg!("OtakuVerse platform initialized!");
        Ok(())
    }

    /// Create a new NFT
    pub fn create_nft(
        ctx: Context<CreateNFT>,
        name: String,
        symbol: String,
        uri: String,
        anime_title: String,
        rarity: NFTRarity,
        price: u64,
        royalty_basis_points: u16,
        description: String,
    ) -> Result<()> {
        require!(name.len() <= 32, OtakuVerseError::NameTooLong);
        require!(symbol.len() <= 10, OtakuVerseError::SymbolTooLong);
        require!(uri.len() <= 200, OtakuVerseError::UriTooLong);
        require!(royalty_basis_points <= 10000, OtakuVerseError::InvalidRoyalty);

        let nft_data = &mut ctx.accounts.nft_data;
        nft_data.mint = ctx.accounts.mint.key();
        nft_data.owner = ctx.accounts.creator.key();
        nft_data.name = name;
        nft_data.symbol = symbol;
        nft_data.uri = uri;
        nft_data.anime_title = anime_title;
        nft_data.rarity = rarity;
        nft_data.is_for_sale = price > 0;
        nft_data.price = price;
        nft_data.created_at = Clock::get()?.unix_timestamp;
        nft_data.creator = ctx.accounts.creator.key();
        nft_data.description = description;
        nft_data.collection_id = None;
        nft_data.attributes = Vec::new();
        nft_data.royalty_basis_points = royalty_basis_points;
        nft_data.is_verified = false;

        // Update platform state
        let platform_state = &mut ctx.accounts.platform_state;
        platform_state.total_nfts += 1;

        msg!("NFT created: {}", nft_data.name);
        Ok(())
    }

    /// Purchase an NFT
    pub fn purchase_nft(ctx: Context<PurchaseNFT>) -> Result<()> {
        let nft_data = &mut ctx.accounts.nft_data;
        
        require!(nft_data.is_for_sale, OtakuVerseError::NFTNotForSale);
        require!(nft_data.owner != ctx.accounts.buyer.key(), OtakuVerseError::CannotBuyOwnNFT);

        let price = nft_data.price;
        let royalty = nft_data.calculate_royalty(price);
        let platform_fee = (price * ctx.accounts.platform_state.platform_fee_basis_points as u64) / 10000;
        let seller_amount = price - royalty - platform_fee;

        // Transfer SOL from buyer to seller
        let transfer_to_seller = Transfer {
            from: ctx.accounts.buyer_token_account.to_account_info(),
            to: ctx.accounts.seller_token_account.to_account_info(),
            authority: ctx.accounts.buyer.to_account_info(),
        };
        token::transfer(
            CpiContext::new(ctx.accounts.token_program.to_account_info(), transfer_to_seller),
            seller_amount,
        )?;

        // Transfer royalty to creator if different from seller
        if nft_data.creator != nft_data.owner && royalty > 0 {
            let transfer_royalty = Transfer {
                from: ctx.accounts.buyer_token_account.to_account_info(),
                to: ctx.accounts.creator_token_account.to_account_info(),
                authority: ctx.accounts.buyer.to_account_info(),
            };
            token::transfer(
                CpiContext::new(ctx.accounts.token_program.to_account_info(), transfer_royalty),
                royalty,
            )?;
        }

        // Transfer platform fee
        if platform_fee > 0 {
            let transfer_fee = Transfer {
                from: ctx.accounts.buyer_token_account.to_account_info(),
                to: ctx.accounts.platform_token_account.to_account_info(),
                authority: ctx.accounts.buyer.to_account_info(),
            };
            token::transfer(
                CpiContext::new(ctx.accounts.token_program.to_account_info(), transfer_fee),
                platform_fee,
            )?;
        }

        // Transfer NFT ownership
        nft_data.transfer(ctx.accounts.buyer.key());

        msg!("NFT purchased: {} for {} lamports", nft_data.name, price);
        Ok(())
    }

    /// Reward NFT for watching videos
    pub fn reward_watch_nft(
        ctx: Context<RewardWatchNFT>,
        watch_time_minutes: u64,
    ) -> Result<()> {
        require!(watch_time_minutes >= 20, OtakuVerseError::InsufficientWatchTime);

        let user_stats = &mut ctx.accounts.user_stats;
        user_stats.total_watch_time += watch_time_minutes;
        user_stats.nfts_earned += 1;

        // Create a reward NFT based on watch time
        let rarity = if watch_time_minutes >= 120 {
            NFTRarity::Legendary
        } else if watch_time_minutes >= 60 {
            NFTRarity::Epic
        } else if watch_time_minutes >= 40 {
            NFTRarity::Rare
        } else {
            NFTRarity::Common
        };

        let nft_data = &mut ctx.accounts.nft_data;
        nft_data.mint = ctx.accounts.mint.key();
        nft_data.owner = ctx.accounts.user.key();
        nft_data.name = format!("Watch Reward #{}", user_stats.nfts_earned);
        nft_data.symbol = "WATCH".to_string();
        nft_data.uri = "https://otakuverse.com/watch-rewards/".to_string();
        nft_data.anime_title = "OtakuVerse Rewards".to_string();
        nft_data.rarity = rarity;
        nft_data.is_for_sale = false;
        nft_data.price = 0;
        nft_data.created_at = Clock::get()?.unix_timestamp;
        nft_data.creator = ctx.accounts.platform_state.authority;
        nft_data.description = format!("Earned by watching {} minutes of anime", watch_time_minutes);
        nft_data.collection_id = None;
        nft_data.attributes = Vec::new();
        nft_data.royalty_basis_points = 0;
        nft_data.is_verified = true;

        msg!("Watch reward NFT created for {} minutes of watch time", watch_time_minutes);
        Ok(())
    }

    /// Create a community
    pub fn create_community(
        ctx: Context<CreateCommunity>,
        name: String,
        description: String,
        anime_focus: String,
    ) -> Result<()> {
        require!(name.len() <= 50, OtakuVerseError::NameTooLong);
        require!(description.len() <= 500, OtakuVerseError::DescriptionTooLong);

        let community = &mut ctx.accounts.community;
        community.creator = ctx.accounts.creator.key();
        community.name = name;
        community.description = description;
        community.anime_focus = anime_focus;
        community.member_count = 1; // Creator is first member
        community.created_at = Clock::get()?.unix_timestamp;
        community.is_active = true;

        // Update platform state
        let platform_state = &mut ctx.accounts.platform_state;
        platform_state.total_communities += 1;

        msg!("Community created: {}", community.name);
        Ok(())
    }

    /// Join a community
    pub fn join_community(ctx: Context<JoinCommunity>) -> Result<()> {
        let community = &mut ctx.accounts.community;
        let membership = &mut ctx.accounts.membership;

        membership.user = ctx.accounts.user.key();
        membership.community = community.key();
        membership.joined_at = Clock::get()?.unix_timestamp;
        membership.is_active = true;

        community.member_count += 1;

        msg!("User joined community: {}", community.name);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    
    #[account(
        init,
        payer = authority,
        space = 8 + PlatformState::INIT_SPACE,
        seeds = [b"platform"],
        bump
    )]
    pub platform_state: Account<'info, PlatformState>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CreateNFT<'info> {
    #[account(mut)]
    pub creator: Signer<'info>,
    
    #[account(
        init,
        payer = creator,
        mint::decimals = 0,
        mint::authority = creator,
    )]
    pub mint: Account<'info, Mint>,
    
    #[account(
        init,
        payer = creator,
        space = 8 + NFTData::INIT_SPACE,
        seeds = [b"nft", mint.key().as_ref()],
        bump
    )]
    pub nft_data: Account<'info, NFTData>,
    
    #[account(
        mut,
        seeds = [b"platform"],
        bump = platform_state.bump
    )]
    pub platform_state: Account<'info, PlatformState>,
    
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct PurchaseNFT<'info> {
    #[account(mut)]
    pub buyer: Signer<'info>,
    
    /// CHECK: Seller account
    #[account(mut)]
    pub seller: AccountInfo<'info>,
    
    /// CHECK: Creator account for royalties
    #[account(mut)]
    pub creator: AccountInfo<'info>,
    
    #[account(
        mut,
        seeds = [b"nft", nft_data.mint.as_ref()],
        bump
    )]
    pub nft_data: Account<'info, NFTData>,
    
    #[account(mut)]
    pub buyer_token_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub seller_token_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub creator_token_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub platform_token_account: Account<'info, TokenAccount>,
    
    #[account(
        seeds = [b"platform"],
        bump = platform_state.bump
    )]
    pub platform_state: Account<'info, PlatformState>,
    
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct RewardWatchNFT<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    
    #[account(
        init,
        payer = user,
        mint::decimals = 0,
        mint::authority = user,
    )]
    pub mint: Account<'info, Mint>,
    
    #[account(
        init,
        payer = user,
        space = 8 + NFTData::INIT_SPACE,
        seeds = [b"nft", mint.key().as_ref()],
        bump
    )]
    pub nft_data: Account<'info, NFTData>,
    
    #[account(
        init_if_needed,
        payer = user,
        space = 8 + UserStats::INIT_SPACE,
        seeds = [b"user_stats", user.key().as_ref()],
        bump
    )]
    pub user_stats: Account<'info, UserStats>,
    
    #[account(
        seeds = [b"platform"],
        bump = platform_state.bump
    )]
    pub platform_state: Account<'info, PlatformState>,
    
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct CreateCommunity<'info> {
    #[account(mut)]
    pub creator: Signer<'info>,
    
    #[account(
        init,
        payer = creator,
        space = 8 + Community::INIT_SPACE,
        seeds = [b"community", creator.key().as_ref(), &(platform_state.total_communities + 1).to_le_bytes()],
        bump
    )]
    pub community: Account<'info, Community>,
    
    #[account(
        mut,
        seeds = [b"platform"],
        bump = platform_state.bump
    )]
    pub platform_state: Account<'info, PlatformState>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct JoinCommunity<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    
    #[account(mut)]
    pub community: Account<'info, Community>,
    
    #[account(
        init,
        payer = user,
        space = 8 + CommunityMembership::INIT_SPACE,
        seeds = [b"membership", community.key().as_ref(), user.key().as_ref()],
        bump
    )]
    pub membership: Account<'info, CommunityMembership>,
    
    pub system_program: Program<'info, System>,
}
