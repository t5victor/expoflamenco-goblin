import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { PlatformPressable } from '@react-navigation/elements';
import * as Haptics from 'expo-haptics';
import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useColorScheme } from '@/hooks/useColorScheme';

export function HapticTab(props: BottomTabBarButtonProps) {
  const colorScheme = useColorScheme();
  const isSelected = Boolean(props.accessibilityState?.selected);

  const bubbleProgress = useSharedValue(isSelected ? 1 : 0);

  useEffect(() => {
    bubbleProgress.value = withTiming(isSelected ? 1 : 0, { duration: 220 });
  }, [isSelected, bubbleProgress]);

  const bubbleStyle = useAnimatedStyle(() => {
    return {
      opacity: 0.9 * bubbleProgress.value,
      transform: [{ scale: 0.85 + 0.15 * bubbleProgress.value }],
    };
  });

  const bubbleColor = colorScheme === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.06)';

  return (
    <PlatformPressable
      {...props}
      style={({ pressed }) => [
        styles.pressable,
        pressed && { opacity: 0.8 },
        // Preserve any style passed from React Navigation
        // @ts-expect-error allow array merge
        props.style,
      ]}
      onPressIn={(ev) => {
        if (process.env.EXPO_OS === 'ios') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        props.onPressIn?.(ev);
      }}
    >
      <Animated.View
        pointerEvents="none"
        style={[styles.bubble, { backgroundColor: bubbleColor }, bubbleStyle]}
      />
      <Animated.View style={styles.contentContainer}>{props.children}</Animated.View>
    </PlatformPressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 24,
  },
  bubble: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    left: 8,
    right: 8,
    borderRadius: 20,
  },
  contentContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
