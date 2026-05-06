/**
 * Wallet Types
 * Frontend-only wallet connection models
 */

export type NetworkName = "sepolia" | "arc" | "unknown"

export interface WalletState {
  isConnected: boolean
  address: string | null
  network: NetworkName
  isCorrectNetwork: boolean
  balance: string | null
  isLoading: boolean
  error: string | null
}

export interface WalletContextType extends WalletState {
  connectWallet(): Promise<void>
  disconnectWallet(): Promise<void>
  switchNetwork(network: NetworkName): Promise<void>
  refresh(): Promise<void>
}

export const NETWORKS = {
  arc: {
    id: 9999, // Mock Arc network ID
    name: "Arc Network",
    rpcUrl: "https://arc.example.com/rpc",
  },
  sepolia: {
    id: 11155111,
    name: "Sepolia Testnet",
    rpcUrl: "https://sepolia.infura.io/v3/YOUR_KEY",
  },
} as const
