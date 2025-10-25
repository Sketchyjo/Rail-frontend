import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Search, ChevronRight, ArrowLeft } from 'lucide-react-native';
import type { SelectedAsset, AssetType } from '../BasketCreationFlow';

// Mock data - replace with actual API data
const AVAILABLE_ASSETS = [
  // Stocks
  { 
    id: 'AMC', 
    symbol: 'AMC', 
    name: 'AMC Entertainment', 
    type: 'stock' as AssetType, 
    price: 178.50,
    logoColor: '#E11F26',
    logoInitials: 'AMC'
  },
  { 
    id: 'AMD', 
    symbol: 'AMD', 
    name: 'AMD', 
    type: 'stock' as AssetType, 
    price: 378.91,
    logoColor: '#000000',
    logoInitials: 'AMD'
  },
  { 
    id: 'ARKB', 
    symbol: 'ARKB', 
    name: 'ARK 21Shares Bitcoin ETF', 
    type: 'etf' as AssetType, 
    price: 140.23,
    logoColor: '#F7931A',
    logoInitials: '₿'
  },
  { 
    id: 'ARKK', 
    symbol: 'ARKK', 
    name: 'ARK Innovation ETF', 
    type: 'etf' as AssetType, 
    price: 242.84,
    logoColor: '#1C1C1C',
    logoInitials: 'ARK'
  },
  { 
    id: 'ARKX', 
    symbol: 'ARKX', 
    name: 'ARK Space Exploration & Innovation', 
    type: 'etf' as AssetType, 
    price: 495.22,
    logoColor: '#1C1C1C',
    logoInitials: 'ARK'
  },
  { 
    id: 'ADBE', 
    symbol: 'ADBE', 
    name: 'Adobe', 
    type: 'stock' as AssetType, 
    price: 445.67,
    logoColor: '#FF0000',
    logoInitials: 'Ai'
  },
  { 
    id: 'BABA', 
    symbol: 'BABA', 
    name: 'Alibaba Group Holding Limited', 
    type: 'stock' as AssetType, 
    price: 381.29,
    logoColor: '#FF6A00',
    logoInitials: '阿'
  },
  { 
    id: 'BOXX', 
    symbol: 'BOXX', 
    name: 'Alpha Architect 1-3 Month Box ETF', 
    type: 'etf' as AssetType, 
    price: 234.56,
    logoColor: '#4A90E2',
    logoInitials: '↗'
  },
  { 
    id: 'AMZN', 
    symbol: 'AMZN', 
    name: 'Amazon', 
    type: 'stock' as AssetType, 
    price: 43250.00,
    logoColor: '#000000',
    logoInitials: 'a'
  },
];

interface AssetSelectionStepProps {
  initialAssets: SelectedAsset[];
  onNext: (assets: SelectedAsset[]) => void;
  onBack: () => void;
}

export const AssetSelectionStep: React.FC<AssetSelectionStepProps> = ({
  initialAssets,
  onNext,
  onBack,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAssets = AVAILABLE_ASSETS.filter((asset) => {
    const matchesSearch =
      asset.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const handleAssetPress = (asset: typeof AVAILABLE_ASSETS[0]) => {
    // Navigate to asset details or add to basket
    console.log('Asset pressed:', asset.symbol);
  };

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="border-b border-gray-100 px-6 pb-4 pt-3">
        <View className="mb-4 flex-row items-center">
          <TouchableOpacity 
            onPress={onBack}
            className="mr-4 h-10 w-10 items-center justify-center"
            activeOpacity={0.7}
          >
            <ArrowLeft size={24} color="#000000" strokeWidth={2} />
          </TouchableOpacity>
          <Text className="flex-1 text-center text-[17px] font-body-semibold text-[#000000]">
            The market is closed
          </Text>
          <View className="h-10 w-10" />
        </View>

        {/* Search Bar */}
        <View className="flex-row items-center rounded-xl bg-[#F5F5F5] px-4 py-3">
          <Search size={18} color="#8E8E93" strokeWidth={2.5} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search"
            placeholderTextColor="#8E8E93"
            className="ml-2 flex-1 text-[16px] font-body text-[#000000]"
          />
        </View>
      </View>

      {/* Stocks Section */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingTop: 20 }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="mb-3 px-6 text-[22px] font-body-bold text-[#000000]">
          Stocks
        </Text>

        {/* Asset List */}
        <View className="px-6">
          {filteredAssets.map((asset, index) => (
            <TouchableOpacity
              key={asset.id}
              onPress={() => handleAssetPress(asset)}
              className="flex-row items-center justify-between py-4"
              style={{
                borderBottomWidth: index < filteredAssets.length - 1 ? 1 : 0,
                borderBottomColor: '#F0F0F0',
              }}
              activeOpacity={0.6}
            >
              <View className="flex-1 flex-row items-center">
                {/* Asset Logo */}
                <View 
                  className="mr-4 h-[52px] w-[52px] items-center justify-center rounded-full"
                  style={{ backgroundColor: asset.logoColor }}
                >
                  <Text className="text-[18px] font-body-bold text-white">
                    {asset.logoInitials}
                  </Text>
                </View>

                {/* Asset Info */}
                <View className="flex-1">
                  <Text className="text-[17px] font-body-semibold text-[#000000]">
                    {asset.name}
                  </Text>
                  <Text className="mt-1 text-[15px] font-body text-[#8E8E93]">
                    {asset.symbol}
                  </Text>
                </View>
              </View>

              {/* Chevron */}
              <ChevronRight size={20} color="#C7C7CC" strokeWidth={2.5} />
            </TouchableOpacity>
          ))}

          {filteredAssets.length === 0 && (
            <View className="items-center py-16">
              <Text className="text-[17px] font-body text-[#8E8E93]">
                No assets found
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};
