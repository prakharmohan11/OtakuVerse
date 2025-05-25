import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { WalletIcon, ClipboardIcon, AlertCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
// TODO: Re-enable wallet functionality
// import useWallet from "@/hooks/useWallet";
// import { useConnection } from "@solana/wallet-adapter-react";
import { PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { toast } from "@/components/ui/sonner";

const PaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { nft } = location.state || {};
  const [amount, setAmount] = useState(nft?.price ? parseFloat(nft.price.replace(' SOL', '')) : 0);
  const [memo, setMemo] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  
  // TODO: Re-enable wallet functionality
  // const { connected, address, connect } = useWallet();
  // const { connection } = useConnection();
  
  // Mock wallet state for debugging
  const connected = false;
  const address = null;
  const connect = () => toast.info("Wallet connection disabled for debugging");

  // Default recipient address (could be from NFT creator or marketplace)
  const recipientAddress = nft?.creatorAddress || "6WVQUSeRZPpZDukYxKc1gLjG1hRtUMHCGpvoC7vsEFw1";

  const handleSendPayment = async () => {
    if (!connected) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    setIsProcessing(true);

    try {
      // TODO: Re-enable real Solana transaction logic
      // Mock payment processing for debugging
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate processing time
      
      toast.success(`Mock payment of ${amount} SOL processed successfully!`);
      
      // Navigate back to marketplace or show success page
      setTimeout(() => {
        navigate('/marketplace');
      }, 2000);

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
                <div className="text-center">
                  <p className="text-white/60 text-sm mb-2">Sending to:</p>
                  <span className="px-4 py-2 bg-[#ede7fe] rounded-full text-[#6c47ff] font-semibold text-sm flex items-center gap-2">
                    <span>{recipientAddress.slice(0, 8)}...{recipientAddress.slice(-8)}</span>
                    <ClipboardIcon 
                      className="w-4 h-4 cursor-pointer" 
                      onClick={() => navigator.clipboard.writeText(recipientAddress)} 
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
                disabled={amount <= 0 || isProcessing}
                className="w-full bg-[#6c47ff] hover:bg-[#7c5aff] text-white text-lg py-2 rounded-xl font-semibold disabled:opacity-60"
              >
                {isProcessing ? "Processing..." : "Send Payment"}
              </Button>
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
