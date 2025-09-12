import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { StyleSheet, View, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { GlassView } from 'expo-glass-effect';
import { useState, useEffect } from 'react';

export default function BlurTabBarBackground() {
  const [useGlassEffect, setUseGlassEffect] = useState(true);

  // Test if glass effect is working - fallback to blur if not
  useEffect(() => {
    // Check iOS version for liquid glass support
    const checkGlassEffectSupport = () => {
      if (Platform.OS !== 'ios') {
        setUseGlassEffect(false);
        return;
      }

      // iOS 26 (18.0+) should support liquid glass
      const iosVersion = parseFloat(Platform.Version as string);
      const supportsGlass = iosVersion >= 18.0;
      
      console.log(`iOS ${Platform.Version} - Glass effect supported: ${supportsGlass}`);
      setUseGlassEffect(supportsGlass);
    };

    // Give a moment for the native module to initialize on physical devices
    const timer = setTimeout(checkGlassEffectSupport, 150);
    return () => clearTimeout(timer);
  }, []);

  // Primary: Use iOS 26 liquid glass effect
  if (useGlassEffect && Platform.OS === 'ios') {
    try {
      return (
        <GlassView
          style={[StyleSheet.absoluteFill, styles.glassBackground]}
          glassEffectStyle="clear"
          intensity={0.8}
        />
      );
    } catch (error) {
      console.warn('Glass effect failed, falling back to blur:', error);
      // Fall through to blur fallback
    }
  }

  // Fallback: Use expo-blur for older iOS or when glass effect fails
  return (
    <BlurView
      style={[StyleSheet.absoluteFill, styles.glassBackground]}
      intensity={80}
      tint="systemMaterial"
    />
  );
}

const styles = StyleSheet.create({
  glassBackground: {
    flex: 1,
    borderRadius: 28,
    overflow: 'hidden',
  },
  glassContainer: {
    // Ensures the glass effect covers the entire tab bar area
    overflow: 'hidden',
  },
});

export function useBottomTabOverflow() {
  return useBottomTabBarHeight();
}
