# Integration Documentation: Portfolio & Wallet APIs

## Overview
This document provides comprehensive integration guidance for two key API endpoints:
1. **Portfolio Overview** - Retrieve user's complete portfolio summary
2. **Wallet Addresses by Chain** - Retrieve user's wallet addresses filtered by blockchain

---

## Table of Contents
- [Authentication](#authentication)
- [Base URL](#base-url)
- [API Endpoints](#api-endpoints)
  - [1. Get Portfolio Overview](#1-get-portfolio-overview)
  - [2. Get Wallet Addresses](#2-get-wallet-addresses)
- [Error Handling](#error-handling)
- [Code Examples](#code-examples)
- [Testing](#testing)

---

## Authentication

All endpoints require JWT Bearer token authentication.

### Headers
```
Authorization: Bearer <JWT_TOKEN>
```

### Obtaining JWT Token
Authentication is handled through the `/api/v1/auth/login` endpoint. The token must be included in all subsequent requests.

---

## Base URL

```
Production: https://api.stack.com
Development: http://localhost:8080
```

All endpoints are versioned under `/api/v1`.

---

## API Endpoints

### 1. Get Portfolio Overview

Retrieves a unified portfolio overview including total balance, buying power, positions value, and 30-day performance metrics.

#### Endpoint
```
GET /api/v1/portfolio/overview
```

#### Request

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Query Parameters:** None

**Request Body:** None

#### Response

**Success Response (200 OK):**

```json
{
  "totalPortfolio": "1250.75",
  "buyingPower": "500.00",
  "positionsValue": "750.75",
  "performanceLast30d": 2.35,
  "currency": "USD",
  "lastUpdated": "2025-10-23T21:12:19Z"
}
```

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `totalPortfolio` | string | Total portfolio value (positions + buying power) formatted to 2 decimals |
| `buyingPower` | string | Available cash balance formatted to 2 decimals |
| `positionsValue` | string | Total market value of all investment positions formatted to 2 decimals |
| `performanceLast30d` | float64 | Portfolio performance percentage over last 30 days |
| `currency` | string | Currency code (always "USD") |
| `lastUpdated` | string | ISO 8601 timestamp of when data was retrieved |

**Performance Calculation:**
```
performance = ((current_positions_value - total_invested) / total_invested) * 100
```
- `current_positions_value` = sum of all position market values
- `total_invested` = sum of (quantity × avg_price) for all positions

#### Error Responses

**401 Unauthorized:**
```json
{
  "code": "UNAUTHORIZED",
  "message": "User not authenticated"
}
```

**500 Internal Server Error:**
```json
{
  "code": "INTERNAL_ERROR",
  "message": "Failed to retrieve portfolio overview"
}
```

#### Implementation Details

- **Handler:** `internal/api/handlers/stack_handlers.go` - `GetPortfolioOverview()`
- **Service:** `internal/domain/services/investing/service.go` - `GetPortfolioOverview()`
- **Entity:** `internal/domain/entities/stack_entities.go` - `PortfolioOverview`
- **Route:** `internal/api/routes/routes.go` - Protected route with authentication middleware

**Data Sources:**
- `balances` table - buying power
- `positions` table - positions value
- Calculations performed in-service for performance metrics

---

### 2. Get Wallet Addresses

Retrieves wallet addresses for the authenticated user, optionally filtered by blockchain chain.

#### Endpoint
```
GET /api/v1/wallet/addresses
```

#### Request

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `chain` | string | No | Filter by blockchain network (see supported chains below) |

**Supported Chains:**

**Mainnet:**
- `ETH` - Ethereum
- `MATIC` - Polygon
- `AVAX` - Avalanche
- `SOL` - Solana
- `APTOS` - Aptos
- `BASE` - Base

**Testnet:**
- `ETH-SEPOLIA` - Ethereum Sepolia
- `MATIC-AMOY` - Polygon Amoy
- `SOL-DEVNET` - Solana Devnet
- `APTOS-TESTNET` - Aptos Testnet
- `BASE-SEPOLIA` - Base Sepolia

**Request Body:** None

#### Response

**Success Response (200 OK) - All Chains:**

```json
{
  "wallets": [
    {
      "chain": "ETH",
      "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
      "status": "live"
    },
    {
      "chain": "SOL",
      "address": "8gVkP2aGZxK4u3Hj9JkMPVz7eQQaQ2W5FnE4cTdR3xYq",
      "status": "live"
    },
    {
      "chain": "APTOS",
      "address": "0xa1b2c3d4e5f6789012345678901234567890123456789012345678901234567",
      "status": "live"
    }
  ]
}
```

**Success Response (200 OK) - Single Chain Filter:**

Request: `GET /api/v1/wallet/addresses?chain=ETH`

```json
{
  "wallets": [
    {
      "chain": "ETH",
      "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
      "status": "live"
    }
  ]
}
```

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `wallets` | array | Array of wallet address objects |
| `wallets[].chain` | string | Blockchain network identifier |
| `wallets[].address` | string | Wallet address on the specified chain |
| `wallets[].status` | string | Wallet status: "creating", "live", "failed" |

#### Error Responses

**400 Bad Request - Invalid User ID:**
```json
{
  "code": "INVALID_USER_ID",
  "message": "Invalid or missing user ID",
  "details": {
    "error": "user ID not found in context or query parameters"
  }
}
```

**400 Bad Request - Invalid Chain:**
```json
{
  "code": "INVALID_CHAIN",
  "message": "Invalid blockchain network",
  "details": {
    "chain": "INVALID_CHAIN",
    "supported_chains": ["ETH", "ETH-SEPOLIA", "SOL", "SOL-DEVNET", "APTOS", "APTOS-TESTNET", "MATIC", "MATIC-AMOY", "BASE", "BASE-SEPOLIA", "AVAX"]
  }
}
```

**404 Not Found - User Not Found:**
```json
{
  "code": "USER_NOT_FOUND",
  "message": "User not found",
  "details": {
    "user_id": "123e4567-e89b-12d3-a456-426614174000"
  }
}
```

**500 Internal Server Error:**
```json
{
  "code": "WALLET_RETRIEVAL_FAILED",
  "message": "Failed to retrieve wallet addresses",
  "details": {
    "error": "Internal server error"
  }
}
```

#### Implementation Details

- **Handler:** `internal/api/handlers/wallet_handlers.go` - `GetWalletAddresses()`
- **Service:** `internal/domain/services/wallet/service.go` - `GetWalletAddresses()`
- **Entity:** `internal/domain/entities/wallet_entities.go` - `WalletAddressesResponse`, `WalletAddressResponse`
- **Route:** `internal/api/routes/routes.go` - Protected route with authentication middleware

**Database Tables:**
- `managed_wallets` - stores wallet addresses and chain information
- `wallet_sets` - references Circle wallet set configuration

**Chain Validation:**
- Chain parameter validated against `WalletChain` enum
- Invalid chains return 400 Bad Request with supported chains list

---

## Error Handling

### Standard Error Response Format

All errors follow a consistent format:

```json
{
  "code": "ERROR_CODE",
  "message": "Human-readable error message",
  "details": {
    "key": "Additional context"
  }
}
```

### Common Error Codes

| HTTP Status | Code | Description |
|-------------|------|-------------|
| 400 | `BAD_REQUEST` | Invalid request format or parameters |
| 400 | `INVALID_USER_ID` | User ID missing or malformed |
| 400 | `INVALID_CHAIN` | Unsupported blockchain network |
| 401 | `UNAUTHORIZED` | Missing or invalid authentication token |
| 404 | `NOT_FOUND` | Requested resource not found |
| 404 | `USER_NOT_FOUND` | User does not exist |
| 500 | `INTERNAL_ERROR` | Internal server error |
| 500 | `WALLET_RETRIEVAL_FAILED` | Failed to retrieve wallet data |

### Error Handling Best Practices

1. **Check HTTP status code first** - Determine error category
2. **Parse error code** - Identify specific error type
3. **Display message to user** - Show human-readable message
4. **Log details** - Include details object in logs for debugging
5. **Implement retries** - For 5xx errors, implement exponential backoff

---

## Code Examples

### cURL

#### Portfolio Overview
```bash
curl -X GET "https://api.stack.com/api/v1/portfolio/overview" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

#### Wallet Addresses (All Chains)
```bash
curl -X GET "https://api.stack.com/api/v1/wallet/addresses" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

#### Wallet Addresses (Single Chain)
```bash
curl -X GET "https://api.stack.com/api/v1/wallet/addresses?chain=ETH" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

---

### JavaScript/TypeScript (Axios)

```typescript
import axios from 'axios';

const API_BASE_URL = 'https://api.stack.com/api/v1';
const JWT_TOKEN = 'your_jwt_token_here';

// Configure axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Authorization': `Bearer ${JWT_TOKEN}`,
    'Content-Type': 'application/json'
  }
});

// Get Portfolio Overview
async function getPortfolioOverview() {
  try {
    const response = await apiClient.get('/portfolio/overview');
    console.log('Portfolio Overview:', response.data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error Code:', error.response?.data.code);
      console.error('Error Message:', error.response?.data.message);
      console.error('Error Details:', error.response?.data.details);
    }
    throw error;
  }
}

// Get Wallet Addresses (All Chains)
async function getWalletAddresses() {
  try {
    const response = await apiClient.get('/wallet/addresses');
    console.log('Wallet Addresses:', response.data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error Code:', error.response?.data.code);
      console.error('Error Message:', error.response?.data.message);
    }
    throw error;
  }
}

// Get Wallet Address by Chain
async function getWalletAddressByChain(chain: string) {
  try {
    const response = await apiClient.get('/wallet/addresses', {
      params: { chain }
    });
    console.log(`${chain} Wallet:`, response.data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error Code:', error.response?.data.code);
      console.error('Error Message:', error.response?.data.message);
    }
    throw error;
  }
}

// Example usage
async function main() {
  // Get portfolio overview
  const portfolio = await getPortfolioOverview();
  console.log('Total Portfolio:', portfolio.totalPortfolio);
  console.log('Buying Power:', portfolio.buyingPower);
  console.log('30d Performance:', portfolio.performanceLast30d, '%');

  // Get all wallet addresses
  const wallets = await getWalletAddresses();
  console.log('Total Wallets:', wallets.wallets.length);

  // Get specific chain wallet
  const ethWallet = await getWalletAddressByChain('ETH');
  console.log('ETH Address:', ethWallet.wallets[0]?.address);
}

main().catch(console.error);
```

---

### Python (requests)

```python
import requests
from typing import Optional, Dict, Any

API_BASE_URL = "https://api.stack.com/api/v1"
JWT_TOKEN = "your_jwt_token_here"

class StackAPIClient:
    def __init__(self, base_url: str, token: str):
        self.base_url = base_url
        self.headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
    
    def get_portfolio_overview(self) -> Dict[str, Any]:
        """Get portfolio overview with balance and performance."""
        url = f"{self.base_url}/portfolio/overview"
        response = requests.get(url, headers=self.headers)
        
        if response.status_code == 200:
            return response.json()
        else:
            error_data = response.json()
            raise Exception(
                f"Error {error_data.get('code')}: {error_data.get('message')}"
            )
    
    def get_wallet_addresses(self, chain: Optional[str] = None) -> Dict[str, Any]:
        """Get wallet addresses, optionally filtered by chain."""
        url = f"{self.base_url}/wallet/addresses"
        params = {"chain": chain} if chain else {}
        
        response = requests.get(url, headers=self.headers, params=params)
        
        if response.status_code == 200:
            return response.json()
        else:
            error_data = response.json()
            raise Exception(
                f"Error {error_data.get('code')}: {error_data.get('message')}"
            )

# Example usage
def main():
    client = StackAPIClient(API_BASE_URL, JWT_TOKEN)
    
    # Get portfolio overview
    portfolio = client.get_portfolio_overview()
    print(f"Total Portfolio: ${portfolio['totalPortfolio']}")
    print(f"Buying Power: ${portfolio['buyingPower']}")
    print(f"Positions Value: ${portfolio['positionsValue']}")
    print(f"30d Performance: {portfolio['performanceLast30d']}%")
    
    # Get all wallet addresses
    wallets = client.get_wallet_addresses()
    print(f"\nTotal Wallets: {len(wallets['wallets'])}")
    for wallet in wallets['wallets']:
        print(f"  {wallet['chain']}: {wallet['address']} ({wallet['status']})")
    
    # Get specific chain wallet
    eth_wallet = client.get_wallet_addresses(chain="ETH")
    if eth_wallet['wallets']:
        print(f"\nETH Address: {eth_wallet['wallets'][0]['address']}")

if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(f"Error: {e}")
```

---

### Go (net/http)

```go
package main

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"
)

const (
	APIBaseURL = "https://api.stack.com/api/v1"
	JWTToken   = "your_jwt_token_here"
)

// PortfolioOverview represents the portfolio overview response
type PortfolioOverview struct {
	TotalPortfolio     string  `json:"totalPortfolio"`
	BuyingPower        string  `json:"buyingPower"`
	PositionsValue     string  `json:"positionsValue"`
	PerformanceLast30d float64 `json:"performanceLast30d"`
	Currency           string  `json:"currency"`
	LastUpdated        string  `json:"lastUpdated"`
}

// WalletAddress represents a single wallet address
type WalletAddress struct {
	Chain   string `json:"chain"`
	Address string `json:"address"`
	Status  string `json:"status"`
}

// WalletAddressesResponse represents the wallet addresses response
type WalletAddressesResponse struct {
	Wallets []WalletAddress `json:"wallets"`
}

// ErrorResponse represents API error response
type ErrorResponse struct {
	Code    string                 `json:"code"`
	Message string                 `json:"message"`
	Details map[string]interface{} `json:"details,omitempty"`
}

// StackAPIClient handles API requests
type StackAPIClient struct {
	BaseURL    string
	HTTPClient *http.Client
	Token      string
}

// NewStackAPIClient creates a new API client
func NewStackAPIClient(baseURL, token string) *StackAPIClient {
	return &StackAPIClient{
		BaseURL: baseURL,
		HTTPClient: &http.Client{
			Timeout: 30 * time.Second,
		},
		Token: token,
	}
}

// GetPortfolioOverview retrieves portfolio overview
func (c *StackAPIClient) GetPortfolioOverview() (*PortfolioOverview, error) {
	url := fmt.Sprintf("%s/portfolio/overview", c.BaseURL)
	
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}
	
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", c.Token))
	req.Header.Set("Content-Type", "application/json")
	
	resp, err := c.HTTPClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("request failed: %w", err)
	}
	defer resp.Body.Close()
	
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response: %w", err)
	}
	
	if resp.StatusCode != http.StatusOK {
		var errResp ErrorResponse
		if err := json.Unmarshal(body, &errResp); err == nil {
			return nil, fmt.Errorf("API error %s: %s", errResp.Code, errResp.Message)
		}
		return nil, fmt.Errorf("unexpected status: %d", resp.StatusCode)
	}
	
	var portfolio PortfolioOverview
	if err := json.Unmarshal(body, &portfolio); err != nil {
		return nil, fmt.Errorf("failed to parse response: %w", err)
	}
	
	return &portfolio, nil
}

// GetWalletAddresses retrieves wallet addresses, optionally filtered by chain
func (c *StackAPIClient) GetWalletAddresses(chain string) (*WalletAddressesResponse, error) {
	url := fmt.Sprintf("%s/wallet/addresses", c.BaseURL)
	if chain != "" {
		url = fmt.Sprintf("%s?chain=%s", url, chain)
	}
	
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}
	
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", c.Token))
	req.Header.Set("Content-Type", "application/json")
	
	resp, err := c.HTTPClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("request failed: %w", err)
	}
	defer resp.Body.Close()
	
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response: %w", err)
	}
	
	if resp.StatusCode != http.StatusOK {
		var errResp ErrorResponse
		if err := json.Unmarshal(body, &errResp); err == nil {
			return nil, fmt.Errorf("API error %s: %s", errResp.Code, errResp.Message)
		}
		return nil, fmt.Errorf("unexpected status: %d", resp.StatusCode)
	}
	
	var wallets WalletAddressesResponse
	if err := json.Unmarshal(body, &wallets); err != nil {
		return nil, fmt.Errorf("failed to parse response: %w", err)
	}
	
	return &wallets, nil
}

func main() {
	client := NewStackAPIClient(APIBaseURL, JWTToken)
	
	// Get portfolio overview
	portfolio, err := client.GetPortfolioOverview()
	if err != nil {
		fmt.Printf("Error getting portfolio: %v\n", err)
		return
	}
	
	fmt.Printf("Portfolio Overview:\n")
	fmt.Printf("  Total Portfolio: $%s\n", portfolio.TotalPortfolio)
	fmt.Printf("  Buying Power: $%s\n", portfolio.BuyingPower)
	fmt.Printf("  Positions Value: $%s\n", portfolio.PositionsValue)
	fmt.Printf("  30d Performance: %.2f%%\n", portfolio.PerformanceLast30d)
	fmt.Printf("  Last Updated: %s\n\n", portfolio.LastUpdated)
	
	// Get all wallet addresses
	wallets, err := client.GetWalletAddresses("")
	if err != nil {
		fmt.Printf("Error getting wallets: %v\n", err)
		return
	}
	
	fmt.Printf("Wallet Addresses (%d total):\n", len(wallets.Wallets))
	for _, wallet := range wallets.Wallets {
		fmt.Printf("  %s: %s (%s)\n", wallet.Chain, wallet.Address, wallet.Status)
	}
	
	// Get specific chain wallet
	ethWallets, err := client.GetWalletAddresses("ETH")
	if err != nil {
		fmt.Printf("Error getting ETH wallet: %v\n", err)
		return
	}
	
	if len(ethWallets.Wallets) > 0 {
		fmt.Printf("\nETH Wallet Address: %s\n", ethWallets.Wallets[0].Address)
	}
}
```

---

## Testing

### Testing with cURL

#### Test Portfolio Overview
```bash
#!/bin/bash

# Set your JWT token
JWT_TOKEN="your_jwt_token_here"
API_URL="http://localhost:8080/api/v1"

echo "Testing Portfolio Overview..."
curl -X GET "${API_URL}/portfolio/overview" \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -H "Content-Type: application/json" \
  -w "\nHTTP Status: %{http_code}\n"
```

#### Test Wallet Addresses
```bash
#!/bin/bash

JWT_TOKEN="your_jwt_token_here"
API_URL="http://localhost:8080/api/v1"

echo "Testing All Wallet Addresses..."
curl -X GET "${API_URL}/wallet/addresses" \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -H "Content-Type: application/json" \
  -w "\nHTTP Status: %{http_code}\n"

echo -e "\nTesting ETH Wallet Address..."
curl -X GET "${API_URL}/wallet/addresses?chain=ETH" \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -H "Content-Type: application/json" \
  -w "\nHTTP Status: %{http_code}\n"

echo -e "\nTesting Invalid Chain..."
curl -X GET "${API_URL}/wallet/addresses?chain=INVALID" \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -H "Content-Type: application/json" \
  -w "\nHTTP Status: %{http_code}\n"
```

### Integration Test Checklist

- [ ] **Authentication**
  - [ ] Valid JWT token returns 200
  - [ ] Missing JWT token returns 401
  - [ ] Invalid JWT token returns 401
  - [ ] Expired JWT token returns 401

- [ ] **Portfolio Overview**
  - [ ] Returns correct portfolio data for authenticated user
  - [ ] Returns zero values for user with no positions
  - [ ] Performance calculation is accurate
  - [ ] All monetary values formatted to 2 decimals
  - [ ] Timestamp is in ISO 8601 format

- [ ] **Wallet Addresses**
  - [ ] Returns all wallet addresses when no chain filter
  - [ ] Returns filtered addresses when chain parameter provided
  - [ ] Returns empty array when user has no wallets
  - [ ] Validates chain parameter correctly
  - [ ] Returns 400 for invalid chain
  - [ ] Returns 404 when user not found

- [ ] **Error Handling**
  - [ ] All errors return proper error response format
  - [ ] Error codes are consistent and documented
  - [ ] Error messages are user-friendly

- [ ] **Performance**
  - [ ] Portfolio overview responds within 500ms
  - [ ] Wallet addresses respond within 300ms
  - [ ] Handles concurrent requests correctly

---

## Additional Resources

### Related Documentation
- [API Authentication Guide](./API_AUTHENTICATION.md)
- [Wallet Setup Guide](../WALLET_SETUP.md)
- [Portfolio API Documentation](./API_PORTFOLIO_OVERVIEW.md)

### Support Chains Reference
- [Circle Developer Portal - Supported Blockchains](https://developers.circle.com/w3s/docs/supported-blockchains)
- [Ethereum Sepolia Testnet](https://sepolia.dev/)
- [Solana Devnet](https://docs.solana.com/clusters#devnet)
- [Aptos Testnet](https://aptos.dev/nodes/networks#testnet)

### OpenTelemetry Tracing
All endpoints are instrumented with OpenTelemetry for distributed tracing. Trace IDs are included in response headers for debugging:
```
X-Trace-Id: <trace_id>
```

---

## Changelog

### Version 1.0.0 (2025-10-23)
- Initial documentation release
- Portfolio overview endpoint documented
- Wallet addresses endpoint documented
- Code examples added for cURL, JavaScript, Python, and Go
- Error handling guide included
- Testing guidelines provided

---

## Contact & Support

For API support or questions:
- **Email:** dev-support@stack.com
- **Documentation:** https://docs.stack.com
- **Status Page:** https://status.stack.com

---

*Last Updated: 2025-10-23*
