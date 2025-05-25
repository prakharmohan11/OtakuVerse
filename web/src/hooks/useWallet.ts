import { useState, useEffect, useCallback } from "react";
import { useWallet as useSolanaWallet } from "@solana/wallet-adapter-react";
import { getWalletStatus, formatWalletAddress } from "@/utils/walletUtils";

export interface UseWalletReturn {
  connected: boolean;
  connecting: boolean;
  address: string | null;
  formattedAddress: string | null;
  walletName: string | null;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  error: string | null;
}

export default function useWallet(): UseWalletReturn {
  const {
    wallet,
    publicKey,
    connected: solanaConnected,
    connecting: solanaConnecting,
    connect: solanaConnect,
    disconnect: solanaDisconnect,
  } = useSolanaWallet();

  const [error, setError] = useState<string | null>(null);
  const [localConnected, setLocalConnected] = useState(false);

  // Update local state when Solana wallet state changes
  useEffect(() => {
    setLocalConnected(solanaConnected);
    if (solanaConnected) {
      setError(null);
    }
  }, [solanaConnected]);

  // Check for direct wallet connections (Phantom, Backpack)
  useEffect(() => {
    const checkWalletStatus = () => {
      const status = getWalletStatus();
      if (status.isConnected && !solanaConnected) {
        setLocalConnected(true);
      }
    };

    checkWalletStatus();
    
    // Listen for wallet events
    const handleAccountChanged = () => {
      checkWalletStatus();
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('accountsChanged', handleAccountChanged);
      return () => {
        window.removeEventListener('accountsChanged', handleAccountChanged);
      };
    }
  }, [solanaConnected]);

  const connect = useCallback(async () => {
    try {
      setError(null);
      await solanaConnect();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect wallet';
      setError(errorMessage);
      console.error('Wallet connection error:', err);
    }
  }, [solanaConnect]);

  const disconnect = useCallback(async () => {
    try {
      setError(null);
      await solanaDisconnect();
      setLocalConnected(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to disconnect wallet';
      setError(errorMessage);
      console.error('Wallet disconnection error:', err);
    }
  }, [solanaDisconnect]);

  const address = publicKey?.toString() || null;
  const formattedAddress = address ? formatWalletAddress(address) : null;
  const walletName = wallet?.adapter?.name || null;

  return {
    connected: localConnected || solanaConnected,
    connecting: solanaConnecting,
    address,
    formattedAddress,
    walletName,
    connect,
    disconnect,
    error,
  };
}
