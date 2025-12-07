import { router } from 'expo-router';
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  Dimensions,
  TouchableOpacity,
  StatusBar,
  ViewStyle,
} from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { onBoard1, onBoard2, onBoard3, onBoard4 } from '../assets/images';
import { Button } from '@/components/ui';

const { width, height } = Dimensions.get('window');

interface OnboardingSlide {
  key: string;
  title: string;
  description: string;
  video: any;
  backgroundColor: string;
  textColor: string;
  indicatorBg: string;
  indicatorActiveBg: string;
  videoStyle?: { width: number; height: number };
}

const onboardingSlides: OnboardingSlide[] = [
  {
    key: '1',
    title: 'Finance built\n for the internet generation.',
    description:
      "We're flipping the script—no suits, no gatekeeping, just DeFi speed and TradFi clout. Your money, your rules.",
    video: onBoard1,
    backgroundColor: '#000',
    textColor: 'text-[#fff]',
    indicatorBg: 'bg-white/30',
    indicatorActiveBg: 'bg-white',
    videoStyle: { width: width, height: height * 0.7 },
  },
  {
    key: '2',
    title: 'Top-Up\nIn A Blink',
    description:
      "Stablecoins on EVM & Solana hit your wallet faster than your ex's apology. Zero waiting, all flexing.",
    video: onBoard2,
    backgroundColor: '#000',
    textColor: 'text-[#fff]',
    indicatorBg: 'bg-white/30',
    indicatorActiveBg: 'bg-black',
    videoStyle: { width: width, height: height * 0.7 },
  },
  {
    key: '3',
    title: 'Invest\nLike A Stan',
    description:
      "Pre-built baskets curated by the smartest nerds. Tech moonshots, eco glow-ups—pick your vibe, we'll handle the rest.",
    video: onBoard3,
    backgroundColor: '#000',
    textColor: 'text-[#fff]',
    indicatorBg: 'bg-slate-400/50',
    indicatorActiveBg: 'bg-slate-800',
    videoStyle: { width: width, height: height * 0.7 },
  },
  {
    key: '4',
    title: 'Swipe\nStack & Repeat',
    description:
      'Cop a card that rounds up every latte and yeets the spare change straight into your portfolio. Cash-back? More like bag-back.',
    video: onBoard4,
    backgroundColor: '#000',
    textColor: 'text-[#fff]',
    indicatorBg: 'bg-slate-400/50',
    indicatorActiveBg: 'bg-slate-800',
    videoStyle: { width: width * 1.05, height: height * 0.7 },
  },
];

const SLIDE_INTERVAL = 6000;

function VideoSlide({ item }: { item: OnboardingSlide }) {
  const player = useVideoPlayer(item.video, (player) => {
    player.loop = true;
    player.muted = true;
    player.play();
  });

  return (
    <View
      className="h-full w-full flex-1 items-center overflow-hidden"
      style={{ width: width, backgroundColor: item.backgroundColor }}>
      <View className="w-full flex-1 items-start px-4 pt-24">
        <Text
          className={`tracking-wides w-full font-display text-[50px] font-black uppercase ${item.textColor}`}>
          {item.title}
        </Text>
        <Text className="mt-4 max-w-xs font-body text-[12px] text-[#fff] opacity-80">
          {item.description}
        </Text>
      </View>
      <VideoView
        player={player}
        style={[item.videoStyle, { position: 'absolute', bottom: 0 }]}
        contentFit="cover"
        nativeControls={false}
      />
    </View>
  );
}

export default function App() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList<OnboardingSlide>>(null);
  const [fontsReady, setFontsReady] = useState(false);
  const viewabilityConfigRef = useRef({ itemVisiblePercentThreshold: 50 }).current;

  useEffect(() => {
    const setWelcomeFlag = async () => {
      try {
        await AsyncStorage.setItem('hasSeenWelcome', 'true');
        setFontsReady(true);
      } catch (error) {
        console.error('Error setting welcome flag:', error);
        setFontsReady(true);
      }
    };
    setWelcomeFlag();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      const nextIndex = (currentIndex + 1) % onboardingSlides.length;
      flatListRef.current?.scrollToIndex({ animated: true, index: nextIndex });
      setCurrentIndex(nextIndex);
    }, SLIDE_INTERVAL);
    return () => clearInterval(timer);
  }, [currentIndex]);

  if (!fontsReady) {
    return <View style={{ flex: 1, backgroundColor: '#949FFF' }} />;
  }

  const renderIndicators = () => {
    const currentSlide = onboardingSlides[currentIndex];
    return (
      <View className="absolute left-6 right-6 top-16 flex-row space-x-2">
        {onboardingSlides.map((_, index) => (
          <View
            key={index}
            className={`h-1 flex-1 rounded-full ${index === currentIndex ? currentSlide.indicatorActiveBg : currentSlide.indicatorBg}`}>
            {index === currentIndex && (
              <View
                className={`h-1 rounded-full ${currentSlide.indicatorActiveBg}`}
                style={{ width: '100%' } as ViewStyle}
              />
            )}
          </View>
        ))}
      </View>
    );
  };

  return (
    <View className="flex-1 bg-white">
      <StatusBar
        barStyle={
          onboardingSlides[currentIndex].backgroundColor === '#D4FF00'
            ? 'dark-content'
            : 'light-content'
        }
      />
      <FlatList
        ref={flatListRef}
        data={onboardingSlides}
        renderItem={({ item }) => <VideoSlide item={item} />}
        horizontal
        pagingEnabled
        bounces={false}
        scrollEventThrottle={16}
        decelerationRate={0.85}
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.key}
        onViewableItemsChanged={({ viewableItems }) => {
          if (viewableItems.length > 0 && viewableItems[0].index !== null) {
            setCurrentIndex(viewableItems[0].index);
          }
        }}
        viewabilityConfig={viewabilityConfigRef}
        getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
      />
      {renderIndicators()}

      <View className="absolute bottom-6 w-full items-center gap-y-2 px-6">
        <Button
          title="Create an account"
          variant="primary"
          onPress={() => router.push('/(auth)/create-passcode')}
        />
        <TouchableOpacity onPress={() => router.push('/login-passcode')}>
          <Text className="text-center font-body-medium text-[14px] text-border-primary">
            Already have an account?
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
