#!/bin/bash

echo "🚀 Deploying OtakuVerse Solana Program to Devnet..."

# Check if we're on devnet
NETWORK=$(solana config get | grep "RPC URL" | awk '{print $3}')
echo "Current network: $NETWORK"

if [[ "$NETWORK" != *"devnet"* ]]; then
    echo "❌ Not on devnet. Switching to devnet..."
    solana config set --url https://api.devnet.solana.com
fi

# Check balance
BALANCE=$(solana balance)
echo "Current balance: $BALANCE"

if [[ "$BALANCE" == "0 SOL" ]]; then
    echo "❌ No SOL balance. Requesting airdrop..."
    solana airdrop 2
    sleep 5
fi

# Build the program
echo "🔨 Building Solana program..."
cargo build-sbf

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

# Deploy the program
echo "📦 Deploying program..."
PROGRAM_ID=$(solana program deploy target/deploy/otakuverse.so --keypair ~/.config/solana/id.json)

if [ $? -eq 0 ]; then
    echo "✅ Program deployed successfully!"
    echo "Program ID: $PROGRAM_ID"
    
    # Save program ID to a file for the frontend
    echo "$PROGRAM_ID" > program_id.txt
    
    echo "🎉 Deployment complete!"
    echo "You can view your program on Solana Explorer:"
    echo "https://explorer.solana.com/address/$PROGRAM_ID?cluster=devnet"
else
    echo "❌ Deployment failed!"
    exit 1
fi