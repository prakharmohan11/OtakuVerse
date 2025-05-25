import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { WalletIcon, ClipboardIcon, AlertCircle, ExternalLink } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import useWallet from "@/hooks/useWallet";
import { useConnection } from "@solana/wallet-adapter-react";
import { PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { toast } from "@/components/ui/sonner";
import { solanaService } from "@/services/solanaService";
import { getExplorerUrl } from "@/config/solana";

const PaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { nft } = location.state || {};
  const [amount, setAmount] = useState(nft?.price ? parseFloat(nft.price.replace(' SOL', '')) : 0);
  const [memo, setMemo] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [balance, setBalance] = useState<number>(0);
  const [transactionSignature, setTransactionSignature] = useState<string | null>(null);
  
  // Real wallet functionality
  const { connected, address, connect, connecting } = useWallet();
  const { connection } = useConnection();

  // Default recipient address (could be from NFT creator or marketplace)
  const recipientAddress = nft?.creatorAddress || "6WVQUSeRZPpZDukYxKc1gLjG1hRtUMHCGpvoC7vsEFw1";

  // Load wallet balance when connected
  useEffect(() => {
    const loadBalance = async () => {
      if (connected && address) {
        try {
          const publicKey = new PublicKey(address);
          const walletBalance = await solanaService.getBalance(publicKey);
          setBalance(walletBalance);
        } catch (error) {
          console.error('Error loading balance:', error);
        }
      }
    };

    loadBalance();
  }, [connected, address]);

  const handleSendPayment = async () => {
    if (!connected || !address) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (amount > balance) {
      toast.error("Insufficient balance");
      return;
    }

    setIsProcessing(true);

    try {
      const recipientPublicKey = new PublicKey(recipientAddress);
      
      // Create and send transaction
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: new PublicKey(address),
          toPubkey: recipientPublicKey,
          lamports: amount * LAMPORTS_PER_SOL,
        })
      );

      // Get the latest blockhash
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = new PublicKey(address);

      // Sign and send transaction using wallet adapter
      const signature = await window.solana?.signAndSendTransaction(transaction);
      
      if (signature) {
        setTransactionSignature(signature);
        toast.success(`Payment of ${amount} SOL sent successfully!`);
        
        // Update balance
        const newBalance = await solanaService.getBalance(new PublicKey(address));
        setBalance(newBalance);
        
        // Navigate back to marketplace after delay
        setTimeout(() => {
          navigate('/marketplace');
        }, 3000);
      } else {
        throw new Error('Transaction failed');
      }

    } catch (error) {
      console.error('Payment error:', error);
      toast.error("Payment failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#18142b] to-[#2c225a] flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 w-full max-w-md border border-white/20">
          {!connected ? (
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-4 text-white">Wallet Not Connected</h2>
              <p className="text-white/80 mb-6">Please connect your wallet to make a payment</p>
              <Button 
                onClick={connect}
                className="w-full bg-[#6c47ff] hover:bg-[#7c5aff] text-white text-lg py-2 rounded-xl font-semibold"
              >
                Connect Wallet
              </Button>
            </div>
          ) : (
            <>
              <div className="flex flex-col items-center mb-6">
                <div className="text-center mb-4">
                  <p className="text-white/60 text-sm mb-2">Wallet Balance:</p>
                  <span className="px-4 py-2 bg-green-500/20 rounded-full text-green-400 font-semibold text-lg">
                    {balance.toFixed(4)} SOL
                  </span>
                </div>
                <div className="text-center">
                  <p className="text-white/60 text-sm mb-2">Sending to:</p>
                  <span className="px-4 py-2 bg-[#ede7fe] rounded-full text-[#6c47ff] font-semibold text-sm flex items-center gap-2">
                    <span>{recipientAddress.slice(0, 8)}...{recipientAddress.slice(-8)}</span>
                    <ClipboardIcon 
                      className="w-4 h-4 cursor-pointer" 
                      onClick={() => {
                        navigator.clipboard.writeText(recipientAddress);
                        toast.success("Address copied to clipboard");
                      }} 
                    />
                  </span>
                </div>
              </div>
              <h2 className="text-2xl font-bold mb-6 text-center text-white">Send Payment</h2>
              {nft && (
                <div className="mb-6 p-4 bg-white/5 rounded-lg border border-white/10">
                  <p className="text-white/80 text-sm">Purchasing:</p>
                  <p className="text-white font-semibold">{nft.name}</p>
                  <p className="text-white/60 text-sm">{nft.anime}</p>
                </div>
              )}
          <label className="block text-white/80 mb-2 font-semibold">Amount (SOL)</label>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-[#6c47ff] font-bold">&#36;</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={e => setAmount(Number(e.target.value))}
              className="flex-1 p-2 rounded bg-white/20 text-white outline-none border border-white/10 focus:border-[#6c47ff]"
              placeholder="0.00"
            />
          </div>
          <label className="block text-white/80 mb-2 font-semibold">Memo (Optional)</label>
          <input
            type="text"
            value={memo}
            onChange={e => setMemo(e.target.value)}
            className="w-full p-2 rounded bg-white/20 text-white outline-none border border-white/10 focus:border-[#6c47ff] mb-4"
            placeholder="Add a note"
          />
          <div className="bg-gradient-to-r from-[#6c47ff] to-[#a084fa] rounded-xl p-4 flex items-center justify-between mb-6">
            <div>
              <div className="text-xs text-white/80">Total Amount</div>
              <div className="text-lg font-bold text-white">{amount.toFixed(2)} SOL</div>
            </div>
            <WalletIcon className="w-7 h-7 text-white/80" />
          </div>
              <Button 
                onClick={handleSendPayment}
                disabled={amount <= 0 || isProcessing || amount > balance}
                className="w-full bg-[#6c47ff] hover:bg-[#7c5aff] text-white text-lg py-2 rounded-xl font-semibold disabled:opacity-60"
              >
                {isProcessing ? "Processing..." : "Send Payment"}
              </Button>
              
              {transactionSignature && (
                <div className="mt-4 p-4 bg-green-500/20 rounded-lg border border-green-500/30">
                  <p className="text-green-400 font-semibold mb-2">✅ Transaction Successful!</p>
                  <div className="flex items-center gap-2">
                    <span className="text-white/80 text-sm">Signature:</span>
                    <span className="text-white/60 text-xs font-mono">
                      {transactionSignature.slice(0, 8)}...{transactionSignature.slice(-8)}
                    </span>
                    <button
                      onClick={() => window.open(getExplorerUrl(transactionSignature, 'devnet'), '_blank')}
                      className="text-blue-400 hover:text-blue-300"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
          <div className="text-xs text-center text-white/60 mt-4">
            Secure transaction powered by Solana blockchain technology
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PaymentPage;
