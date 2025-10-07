import React, { useEffect } from 'react';
import { View, Text, Dimensions, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  withSequence,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { Home, CreditCard, User } from 'lucide-react-native';

const { width: screenWidth } = Dimensions.get('window');

interface TabBarProps {
  state: any;
  descriptors: any;
  navigation: any;
}

interface TabItem {
  key: string;
  name: string;
  icon: any;
  label: string;
}

const tabItems: TabItem[] = [
  { key: 'index', name: 'index', icon: Home, label: 'Home' },
  { key: 'card', name: 'card', icon: CreditCard, label: 'Card' },
  { key: 'profile', name: 'profile', icon: User, label: 'Profile' },
];

const FloatingTabBar: React.FC<TabBarProps> = ({ state, descriptors, navigation }) => {
  const insets = useSafeAreaInsets();
  const activeIndex = useSharedValue(0);
  const tabBarScale = useSharedValue(0.9);
  const tabBarOpacity = useSharedValue(0);
  const tabWidth = (screenWidth - 60) / tabItems.length;

  useEffect(() => {
    tabBarScale.value = withSpring(1, { damping: 15, stiffness: 150 });
    tabBarOpacity.value = withTiming(1, { duration: 300 });
  }, []);

  useEffect(() => {
    activeIndex.value = withSpring(state.index, { damping: 15, stiffness: 150 });
  }, [state.index]);

  const animatedTabBarStyle = useAnimatedStyle(() => ({
    transform: [{ scale: tabBarScale.value }],
    opacity: tabBarOpacity.value,
  }));

  const animatedIndicatorStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      activeIndex.value,
      [0, 1, 2],
      [tabWidth * 0.5, tabWidth * 1.5, tabWidth * 2.5]
    );
    return { transform: [{ translateX: translateX - 40 }] };
  });

  const handleTabPress = (route: any, index: number) => {
    import('expo-haptics').then(Haptics =>
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    );
    tabBarScale.value = withSequence(
      withTiming(0.95, { duration: 100 }),
      withSpring(1, { damping: 15, stiffness: 150 })
    );
    const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
    if (!event.defaultPrevented) navigation.navigate(route.name);
  };

  return (
    <Animated.View
      className="absolute bottom-5 left-5 right-5 h-[80px]"
      style={[{ bottom: insets.bottom + 20 }, animatedTabBarStyle]}
    >
      <BlurView intensity={20} tint="light" className="flex-1 rounded-[40px] overflow-hidden">
        <View className="flex-1 bg-white/90 rounded-[40px] shadow-lg border border-white/20">
          <Animated.View
            className="absolute top-2.5 left-0 w-[80px] h-[55px] rounded-full bg-blue-500"
            style={[
              {
                shadowColor: '#3b82f6',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 8,
              },
              animatedIndicatorStyle,
            ]}
          />
          <View className="flex-1 flex-row">
            {tabItems.map((item, index) => {
              const isFocused = state.index === index;
              const route = state.routes[index];
              return (
                <TabButton
                  key={item.key}
                  onPress={() => handleTabPress(route, index)}
                  index={index}
                  activeIndex={activeIndex}
                >
                  <TabIcon icon={item.icon} focused={isFocused} index={index} activeIndex={activeIndex} />
                  <TabLabel label={item.label} focused={isFocused} index={index} activeIndex={activeIndex} />
                </TabButton>
              );
            })}
          </View>
        </View>
      </BlurView>
    </Animated.View>
  );
};

const TabIcon: React.FC<{ icon: any; focused: boolean; index: number; activeIndex: any }> = ({
  icon: Icon,
  focused,
  index,
  activeIndex,
}) => {
  const animatedIconStyle = useAnimatedStyle(() => {
    const scale = interpolate(activeIndex.value, [index - 1, index, index + 1], [1, 1.25, 1], 'clamp');
    const translateY = interpolate(activeIndex.value, [index - 1, index, index + 1], [0, -3, 0], 'clamp');
    return { transform: [{ scale }, { translateY }] };
  });
  return (
    <Animated.View style={animatedIconStyle}>
      <Icon size={26} color={focused ? '#ffffff' : '#6b7280'} strokeWidth={focused ? 2.5 : 2} />
    </Animated.View>
  );
};

const TabLabel: React.FC<{ label: string; focused: boolean; index: number; activeIndex: any }> = ({
  label,
  focused,
  index,
  activeIndex,
}) => {
  const animatedLabelStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      activeIndex.value,
      [index - 1, index, index + 1],
      [0.6, focused ? 0 : 1, 0.6],
      'clamp'
    );
    const scale = interpolate(
      activeIndex.value,
      [index - 1, index, index + 1],
      [0.9, focused ? 0 : 1, 0.9],
      'clamp'
    );
    return { opacity, transform: [{ scale }] };
  });
  return (
    <Animated.Text
      className="text-[11px] font-semibold mt-1"
      style={[{ color: focused ? '#ffffff' : '#6b7280' }, animatedLabelStyle]}
    >
      {label}
    </Animated.Text>
  );
};

const TabButton: React.FC<{ children: React.ReactNode; onPress: () => void; index: number; activeIndex: any }> = ({
  children,
  onPress,
}) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const animatedButtonStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }], opacity: opacity.value }));
  const handlePressIn = () => {
    scale.value = withSpring(0.9, { damping: 15, stiffness: 300 });
    opacity.value = withTiming(0.8, { duration: 100 });
  };
  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
    opacity.value = withTiming(1, { duration: 200 });
  };
  return (
    <Pressable onPress={onPress} onPressIn={handlePressIn} onPressOut={handlePressOut} className="flex-1 justify-center items-center">
      <Animated.View style={animatedButtonStyle}>{children}</Animated.View>
    </Pressable>
  );
};

export default FloatingTabBar;
