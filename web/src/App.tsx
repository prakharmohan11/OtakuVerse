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

// Create a client
const queryClient = new QueryClient();

// Simple App without wallet adapters for testing
const App = () => {
  console.log("App component is rendering!");
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Router>
          <Routes>
            <Route path="/" element={<TestIndex />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/anime" element={<AnimeLibrary />} />
            <Route path="/watch/:id" element={<WatchPage />} />
            <Route path="/communities" element={<Communities />} />
            <Route path="/community/:id" element={<CommunityPage />} />
            <Route path="/community/:id/discord" element={<CommunityDiscord />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/payment" element={<PaymentPage />} />
            <Route path="/communities-showcase" element={<CommunitiesShowcase />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;