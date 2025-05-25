import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { WalletIcon, ClipboardIcon, AlertCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const PaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { nft } = location.state || {};
  const [amount, setAmount] = useState(nft?.price ? parseFloat(nft.price.replace(' SOL', '')) : 0);
  const [memo, setMemo] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = async () => {
    setIsProcessing(true);
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      navigate("/dashboard");
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto bg-white/10 backdrop-blur-md rounded-xl p-8">
          <h1 className="text-3xl font-bold text-white mb-8 text-center">Payment</h1>
          
          {nft && (
            <div className="mb-6 p-4 bg-white/5 rounded-lg">
              <h3 className="text-xl font-semibold text-white mb-2">{nft.name}</h3>
              <p className="text-gray-300">{nft.description}</p>
              <p className="text-2xl font-bold text-purple-400 mt-2">{nft.price}</p>
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label className="block text-white mb-2">Amount (SOL)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(parseFloat(e.target.value))}
                className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white"
                step="0.01"
                min="0"
              />
            </div>

            <div>
              <label className="block text-white mb-2">Memo (Optional)</label>
              <input
                type="text"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white"
                placeholder="Payment memo..."
              />
            </div>

            <Button
              onClick={handlePayment}
              disabled={isProcessing || amount <= 0}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  <WalletIcon className="w-4 h-4 mr-2" />
                  Pay {amount} SOL
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PaymentPage;