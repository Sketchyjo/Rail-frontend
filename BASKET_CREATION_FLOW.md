# Basket Creation Flow

## Overview
A comprehensive 4-step flow for creating and investing in custom baskets of stocks, ETFs, and crypto assets.

## User Flow

### Step 1: Basket Information
**File:** `components/basket/steps/BasketInfoStep.tsx`

Users provide:
- **Basket Name** (max 50 chars) - e.g., "Tech Growth Portfolio"
- **Ticker Symbol** (max 10 chars) - e.g., "TECH-01" 
- **Description** (max 200 chars) - Investment strategy description
- **Lock Period** - Choose from 1 month, 3 months, 6 months, or 1 year

**Design Features:**
- Character counters for inputs
- Visual lock period selection with pink highlight
- Info card explaining lock period benefits
- Form validation before proceeding

### Step 2: Asset Selection
**File:** `components/basket/steps/AssetSelectionStep.tsx`

Users can:
- Search assets by symbol or name
- Filter by type (All, Stocks, ETFs, Crypto)
- Select multiple assets with checkboxes
- View asset details (price, type badges)

**Design Features:**
- Search bar with icon
- Horizontal scrollable filter tabs
- Asset cards with:
  - Type-specific icons and color coding
  - Symbol, name, and current price
  - Type badges (pink for stocks, green for ETFs, orange for crypto)
  - Selection checkboxes
- Counter showing selected/available assets

### Step 3: Allocation
**File:** `components/basket/steps/AllocationStep.tsx`

Users allocate percentages across selected assets:
- Manual percentage input for each asset
- Real-time total calculation
- Visual progress bar showing allocation status
- Quick "Distribute Evenly" button
- Validation to ensure exactly 100% allocation

**Design Features:**
- Large allocation summary card with progress bar
- Color-coded validation (red for over, green for complete, pink for in-progress)
- Individual asset cards with:
  - Input fields for percentages
  - Visual allocation bars
  - Asset icons and names
- Contextual alerts for over/under allocation

### Step 4: Investment Amount
**File:** `components/basket/steps/InvestmentAmountStep.tsx`

Uses the existing `AmountInput` component to:
- Enter investment amount with custom keypad
- Show buying power and minimum investment
- Display projected breakdown by asset
- Calculate estimated shares for each asset
- Show informational cards about execution, lock period, and tracking

**Design Features:**
- Large currency display with custom keypad
- Account selector
- Max button for quick full investment
- Projected breakdown card showing:
  - Amount per asset
  - Estimated shares
  - Allocation percentages
- Info cards about basket features
- Validation for minimum investment and buying power

## Navigation

### Entry Point
From the dashboard (`app/(tabs)/index.tsx`), users tap the "Create" button on the BalanceCard.

### Route
- **Path:** `/basket/create`
- **File:** `app/basket/create.tsx`

### Navigation Flow
```
Dashboard → Basket Creation Screen
  ├─ Step 1: Basket Info
  ├─ Step 2: Asset Selection  
  ├─ Step 3: Allocation
  └─ Step 4: Investment Amount → Success Alert → Dashboard
```

### Back Navigation
- First step: Returns to dashboard
- Other steps: Returns to previous step
- Back button in header for all steps

## Design System

### Colors
- Primary accent: `#FB088F` (pink/magenta)
- Background: `#F9FAFB` (light gray)
- Cards: `#F7F7F7` 
- Borders: `#E5E7EB` (gray-200)
- Text primary: `#070914`
- Text secondary: `#6B7280`

### Type Indicators
- **Stocks:** Pink (`#FB088F`) with TrendingUp icon
- **ETFs:** Green (`#4CAF50`) with Layers icon  
- **Crypto:** Orange (`#F7931A`) with Bitcoin icon

### Typography
- Headers: `font-body-bold` at 20-24px
- Body: `font-body-medium` at 14-16px
- Labels: `font-body-semibold` at 12-14px
- Inputs: `font-body-medium` at 16px

### Spacing
- Screen padding: 24px horizontal
- Card padding: 16-20px
- Element gaps: 12-16px
- Section margins: 24-32px bottom

### Components
- Rounded corners: 16-24px (xl to 2xl)
- Progress bar: 1.5px height, rounded-full
- Buttons: Full width, 16px vertical padding
- Input fields: 16px padding, 2xl rounded

## State Management

### Local State
```typescript
interface BasketInfo {
  name: string;
  ticker: string;
  description: string;
  lockPeriod: string;
}

interface SelectedAsset {
  id: string;
  symbol: string;
  name: string;
  type: 'stock' | 'etf' | 'crypto';
  allocation: number;
  currentPrice?: number;
}
```

### Flow State
- Current step tracking
- Form data persistence across steps
- Progress calculation (0-100%)

## Integration Points

### TODO: Backend Integration
1. **Asset List API** - Replace mock data in `AssetSelectionStep.tsx`
2. **Create Basket API** - Implement in `app/basket/create.tsx` `handleComplete()`
3. **User Balance** - Fetch real buying power in `InvestmentAmountStep.tsx`
4. **Validation** - Add server-side ticker uniqueness check

### Components Used
- `Button` from `components/ui/Button.tsx`
- `AmountInput` from `components/molecules/AmountInput.tsx`
- `BalanceCard` from `components/molecules/BalanceCard.tsx`

## Features

### Validation
- ✅ Required fields checking
- ✅ Character limits
- ✅ 100% allocation requirement
- ✅ Minimum investment amount
- ✅ Buying power verification

### UX Enhancements
- ✅ Step-by-step progress indicator
- ✅ Back navigation with state preservation
- ✅ Real-time validation feedback
- ✅ Quick actions (distribute evenly, max button)
- ✅ Visual feedback (colors, icons, progress bars)
- ✅ Contextual help text and info cards
- ✅ Success confirmation with options

### Accessibility
- ✅ Clear labels and instructions
- ✅ Touch-friendly button sizes (min 44px)
- ✅ Proper contrast ratios
- ✅ Keyboard support for inputs

## Testing Checklist

- [ ] Test all 4 steps in sequence
- [ ] Test back navigation at each step
- [ ] Verify form validation works
- [ ] Test allocation adds to 100%
- [ ] Test distribute evenly calculation
- [ ] Test investment amount validation
- [ ] Test search and filters in asset selection
- [ ] Verify mobile responsiveness
- [ ] Test with various screen sizes
- [ ] Verify proper routing to/from dashboard

## Future Enhancements

1. **Asset Search** - Add debounced API search
2. **Templates** - Pre-built basket templates
3. **Rebalancing** - Auto-rebalance options
4. **Social Features** - Share basket configurations
5. **Analytics** - Projected returns and risk metrics
6. **Recurring Investment** - Schedule automatic investments
7. **Tax Optimization** - Tax-loss harvesting suggestions
