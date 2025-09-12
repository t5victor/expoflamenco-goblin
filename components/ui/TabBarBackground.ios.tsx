import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { StyleSheet } from 'react-native';
import { GlassView } from 'expo-glass-effect';

export default function BlurTabBarBackground() {
  return (
    <GlassView
      style={[StyleSheet.absoluteFill, styles.glassBackground]}
      glassEffectStyle="clear"
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
