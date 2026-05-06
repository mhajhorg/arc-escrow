/**
 * Wallet Context
 * Manages wallet connection state and network detection
 * Frontend-only: No blockchain execution, prepared for wagmi integration
 */

"use client"

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from "react"
import type { WalletState, WalletContextType, NetworkName } from "./types"

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function WalletProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<WalletState>({
    isConnected: false,
    address: null,
    network: "unknown",
    isCorrectNetwork: false,
    balance: null,
    isLoading: false,
    error: null,
  })

  // Restore wallet state from storage on mount
  useEffect(() => {
    const restoreWallet = () => {
      try {
        const stored = localStorage.getItem("arc_wallet_state")
        if (stored) {
          const walletState = JSON.parse(stored)
          setState(walletState)
        }
      } catch (error) {
        console.error("Failed to restore wallet state:", error)
      }
    }

    restoreWallet()
  }, [])

  const connectWallet = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }))
    
    try {
      // Simulate wallet connection
      await new Promise((resolve) => setTimeout(resolve, 800))

      // Mock wallet address - in real implementation, wagmi handles this
      const mockAddress = "0x" + "a".repeat(40)
      const mockNetworks: NetworkName[] = ["sepolia", "arc"]
      const mockNetwork: NetworkName = mockNetworks[Math.floor(Math.random() * mockNetworks.length)]
      
      const newState: WalletState = {
        isConnected: true,
        address: mockAddress,
        network: mockNetwork,
        isCorrectNetwork: mockNetwork === "arc",
        balance: "10.5",
        isLoading: false,
        error: null,
      }

      setState(newState)
      localStorage.setItem("arc_wallet_state", JSON.stringify(newState))
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : "Failed to connect wallet",
      }))
    }
  }, [])

  const disconnectWallet = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true }))
    
    try {
      // Simulate disconnect delay
      await new Promise((resolve) => setTimeout(resolve, 300))

      const newState: WalletState = {
        isConnected: false,
        address: null,
        network: "unknown",
        isCorrectNetwork: false,
        balance: null,
        isLoading: false,
        error: null,
      }

      setState(newState)
      localStorage.removeItem("arc_wallet_state")
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : "Failed to disconnect wallet",
      }))
    }
  }, [])

  const switchNetwork = useCallback(async (network: NetworkName) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }))
    
    try {
      // Simulate network switch
      await new Promise((resolve) => setTimeout(resolve, 600))

      setState((prev) => ({
        ...prev,
        network,
        isCorrectNetwork: network === "arc",
        isLoading: false,
      }))
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : "Failed to switch network",
      }))
    }
  }, [])

  const refresh = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true }))
    
    try {
      // Simulate balance/state refresh
      await new Promise((resolve) => setTimeout(resolve, 400))
      setState((prev) => ({ ...prev, isLoading: false }))
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : "Failed to refresh",
      }))
    }
  }, [])

  const value: WalletContextType = {
    ...state,
    connectWallet,
    disconnectWallet,
    switchNetwork,
    refresh,
  }

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
}

export function useWallet() {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error("useWallet must be used within WalletProvider")
  }
  return context
}
