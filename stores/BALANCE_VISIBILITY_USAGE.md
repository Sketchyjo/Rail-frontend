# Balance Visibility Feature Usage

## Overview
The balance visibility toggle is managed by the `useUIStore` Zustand store. This allows you to hide/show balance values across the entire app from a single global state.

## Implementation

### 1. Store Created
- **File**: `stores/uiStore.ts`
- **State**: `isBalanceVisible` (boolean)
- **Actions**: 
  - `toggleBalanceVisibility()` - Toggles visibility
  - `setBalanceVisibility(visible: boolean)` - Sets visibility directly

### 2. Already Integrated
- **BalanceCard Component**: Clicking the eye icon toggles visibility
- All balance values in BalanceCard (balance, buying power, percent change) are masked when hidden

## Usage in Other Components

### Example 1: Simple Balance Display

```tsx
import { useUIStore } from '@/stores';

const MyComponent = () => {
  const { isBalanceVisible } = useUIStore();
  const balance = '$1,234.56';

  // Helper function to mask values
  const maskValue = (value: string) => {
    if (isBalanceVisible) return value;
    return value.replace(/[\d,\.]+/g, (match) => '−'.repeat(Math.min(match.length, 6)));
  };

  return (
    <Text>{maskValue(balance)}</Text>
  );
};
```

### Example 2: With Toggle Button

```tsx
import { useUIStore } from '@/stores';
import { Eye, EyeOff } from 'lucide-react-native';

const MyBalanceComponent = () => {
  const { isBalanceVisible, toggleBalanceVisibility } = useUIStore();
  const balance = '$1,234.56';

  const maskValue = (value: string) => {
    if (isBalanceVisible) return value;
    return value.replace(/[\d,\.]+/g, (match) => '−'.repeat(Math.min(match.length, 6)));
  };

  return (
    <View>
      <Text>{maskValue(balance)}</Text>
      <TouchableOpacity onPress={toggleBalanceVisibility}>
        {isBalanceVisible ? <Eye /> : <EyeOff />}
      </TouchableOpacity>
    </View>
  );
};
```

### Example 3: Setting Visibility Directly

```tsx
import { useUIStore } from '@/stores';

const SettingsScreen = () => {
  const { isBalanceVisible, setBalanceVisibility } = useUIStore();

  return (
    <Switch
      value={isBalanceVisible}
      onValueChange={setBalanceVisibility}
    />
  );
};
```

## How It Works

1. **Persistence**: The state is persisted to AsyncStorage, so the user's preference is maintained across app restarts
2. **Global State**: All components using `useUIStore` will automatically update when visibility changes
3. **Masking**: Numbers are replaced with en-dashes (−) while keeping currency symbols and other characters

## Components That Should Use This

Consider implementing this feature in:
- Transaction items (amount field)
- Account cards
- Portfolio summaries
- Any component displaying financial amounts
- Statistics and charts (optional)

