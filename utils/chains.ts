/**
 * Chain Utilities
 * Helper functions for blockchain network operations
 */

import type { TestnetChain } from '@/api/types';

/**
 * Map deposit network IDs to testnet blockchain chains
 * This ensures we only use testnet addresses for development
 */
export const NETWORK_TO_TESTNET_MAP: Record<string, TestnetChain> = {
  'solana': 'SOL-DEVNET',
  'base': 'BASE-SEPOLIA',
  'polygon': 'MATIC-AMOY',
  'bnb': 'ETH-SEPOLIA',
} as const;

/**
 * Get testnet chain for a given network ID
 */
export function getTestnetChain(networkId?: string): TestnetChain | undefined {
  if (!networkId) return undefined;
  return NETWORK_TO_TESTNET_MAP[networkId];
}

/**
 * Check if a chain is a testnet
 */
export function isTestnetChain(chain: string): boolean {
  return chain.includes('SEPOLIA') || 
         chain.includes('DEVNET') || 
         chain.includes('AMOY') || 
         chain.includes('TESTNET');
}

/**
 * Get display name for chain
 */
export function getChainDisplayName(chain: TestnetChain): string {
  const names: Record<TestnetChain, string> = {
    'ETH-SEPOLIA': 'Ethereum Sepolia',
    'MATIC-AMOY': 'Polygon Amoy',
    'SOL-DEVNET': 'Solana Devnet',
    'APTOS-TESTNET': 'Aptos Testnet',
    'BASE-SEPOLIA': 'Base Sepolia',
  };
  return names[chain];
}
