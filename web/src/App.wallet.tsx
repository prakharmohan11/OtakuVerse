import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import TestIndex from "./pages/TestIndex";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import AnimeLibrary from "./pages/AnimeLibrary";
import WatchPage from "./pages/WatchPage";
import Communities from "./pages/Communities";
import NotFound from "./pages/NotFound";
import Marketplace from "./pages/Marketplace";
import PaymentPage from "./pages/PaymentPage";
import CommunitiesShowcase from "@/components/CommunitiesShowcase";
import CommunityPage from "@/pages/CommunityPage";
import CommunityDiscord from "./pages/CommunityDiscord";
import { createElement, useMemo } from "react";

// Solana wallet imports
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';

// Import wallet adapter CSS
import '@solana/wallet-adapter-react-ui/styles.css';

// Create a client
const queryClient = new QueryClient();

// Fix the function component syntax
const App = () => {
  console.log("App component is rendering!");
  
  // Configure Solana network (devnet for development)
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);
  
  // Configure supported wallets
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
    ],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <QueryClientProvider client={queryClient}>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <Router>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/anime" element={<AnimeLibrary />} />
                  <Route path="/watch/:animeId" element={<WatchPage />} />
                  <Route path="/communities" element={<Communities />} />
                  <Route path="/communities/:id" element={<CommunityPage />} />
                  <Route path="/marketplace" element={<Marketplace />} />
                  <Route path="/community-discord/:communityId" element={<CommunityDiscord />} />
                  <Route path="/payment" element={<PaymentPage />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Router>
            </TooltipProvider>
          </QueryClientProvider>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export default App;
