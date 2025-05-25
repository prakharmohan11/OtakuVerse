#!/bin/bash

# OtakuVerse Solana Program Deployment Script
# This script deploys the OtakuVerse program to Solana devnet

set -e

echo "🚀 Starting OtakuVerse Solana Program Deployment..."

# Check if Solana CLI is installed
if ! command -v solana &> /dev/null; then
    echo "❌ Solana CLI not found. Please install it first."
    exit 1
fi

# Set up environment
export PATH="/root/.local/share/solana/install/active_release/bin:$PATH"
source "$HOME/.cargo/env"

# Configure for devnet
echo "🔧 Configuring Solana CLI for devnet..."
solana config set --url https://api.devnet.solana.com

# Check balance and airdrop if needed
echo "💰 Checking SOL balance..."
BALANCE=$(solana balance --lamports)
if [ "$BALANCE" -lt 1000000000 ]; then
    echo "💸 Requesting airdrop..."
    solana airdrop 2
fi

# Generate program keypair if it doesn't exist
PROGRAM_KEYPAIR="./otakuverse-program-keypair.json"
if [ ! -f "$PROGRAM_KEYPAIR" ]; then
    echo "🔑 Generating program keypair..."
    solana-keygen new --outfile "$PROGRAM_KEYPAIR" --no-bip39-passphrase
fi

# Build the program
echo "🔨 Building Solana program..."
cd simple-program

# Try different build methods
if command -v anchor &> /dev/null; then
    echo "📦 Building with Anchor..."
    anchor build
elif command -v cargo-build-sbf &> /dev/null; then
    echo "📦 Building with cargo-build-sbf..."
    cargo build-sbf
else
    echo "📦 Building with cargo build-bpf..."
    cargo build-bpf
fi

# Deploy the program
echo "🚀 Deploying program to devnet..."
PROGRAM_ID=$(solana program deploy target/deploy/otakuverse_simple.so --program-id "$PROGRAM_KEYPAIR")

echo "✅ Program deployed successfully!"
echo "📋 Program ID: $PROGRAM_ID"
echo "🌐 Network: Devnet"
echo "💾 Keypair saved to: $PROGRAM_KEYPAIR"

# Save program ID to a file for frontend use
echo "$PROGRAM_ID" > ../web/src/config/program-id.txt

echo "🎉 Deployment complete! Program ID saved to web/src/config/program-id.txt"
echo "🔗 View on Solana Explorer: https://explorer.solana.com/address/$PROGRAM_ID?cluster=devnet"