import React, { useEffect, useRef, useState } from "react";
import { Animated, Dimensions, Easing, Image, StyleSheet, View } from "react-native";
import { Stack } from "expo-router";

import LoginScreen from "../screens/LoginScreen";

const { width } = Dimensions.get("window");
const LOGO_SIZE = Math.min(width * 0.6, 220);
const PULSE_BASE_SIZE = 10;

const AnimatedImage = Animated.createAnimatedComponent(Image);
const AnimatedView = Animated.createAnimatedComponent(View);

export default function WelcomeScreen() {
  const [showSplash, setShowSplash] = useState(true);
  const splashOpacity = useRef(new Animated.Value(1)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.88)).current;
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const pulseLoopRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 520,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(logoScale, {
        toValue: 1,
        duration: 520,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    pulseAnim.setValue(0);
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(1000),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
      { resetBeforeIteration: true }
    );
    pulseLoopRef.current = loop;
    loop.start();

    const hideTimeout = setTimeout(() => {
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 0,
          duration: 420,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(logoScale, {
          toValue: 0.95,
          duration: 420,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(splashOpacity, {
          toValue: 0,
          duration: 520,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 200,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start(() => {
        pulseLoopRef.current?.stop();
        pulseLoopRef.current = null;
        pulseAnim.setValue(0);
        setShowSplash(false);
      });
    }, 2600);

    return () => {
      pulseLoopRef.current?.stop();
      pulseLoopRef.current = null;
      clearTimeout(hideTimeout);
    };
  }, []);

  const pulseScale = pulseAnim.interpolate({
    inputRange: [0, 0.2, 0.8, 1],
    outputRange: [0.2, 25, 25, 0.2],
    extrapolate: "clamp",
  });

  const pulseOpacity = pulseAnim.interpolate({
    inputRange: [0, 0.2, 0.8, 1],
    outputRange: [0, 0.35, 0, 0],
    extrapolate: "clamp",
  });

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.body}>
        <LoginScreen />
        {showSplash && (
          <Animated.View
            style={[
              StyleSheet.absoluteFillObject,
              styles.overlay,
              { opacity: splashOpacity },
            ]}
          >
            <View style={styles.pulse}>
              <AnimatedView
                pointerEvents="none"
                style={[
                  styles.pulseAfter,
                  {
                    opacity: pulseOpacity,
                    transform: [{ scale: pulseScale }],
                  },
                ]}
              />
              <AnimatedImage
                source={require("../assets/images/EX-PO.png")}
                style={[
                  styles.pulseImage,
                  {
                    opacity: logoOpacity,
                    transform: [{ scale: logoScale }],
                  },
                ]}
                resizeMode="contain"
              />
            </View>
          </Animated.View>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    backgroundColor: "#000",
  },
  overlay: {
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
  },
  pulse: {
    position: "relative",
    zIndex: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  pulseImage: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    tintColor: "#fff",
    position: "relative",
    zIndex: 2,
  },
  pulseAfter: {
    position: "absolute",
    zIndex: 1,
    width: PULSE_BASE_SIZE,
    height: PULSE_BASE_SIZE,
    borderRadius: PULSE_BASE_SIZE / 2,
    backgroundColor: "rgba(255, 255, 255, 0.18)",
    shadowColor: "#fff",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 120,
    elevation: 45,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
});
