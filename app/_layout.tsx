import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Head from 'expo-router/head';
import { View, ActivityIndicator } from 'react-native';

import { useColorScheme } from '@/hooks/useColorScheme';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { TranslationProvider } from '@/hooks/useTranslation';
import LoginScreen from '@/screens/LoginScreen';
import { usePrefetchScheduler } from '@/hooks/usePrefetchScheduler';

function AppContent() {
  const { isAuthenticated, isLoading, user } = useAuth();

  usePrefetchScheduler(
    user
      ? {
          userId: user.userId,
          token: user.token,
        }
      : null
  );

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <TranslationProvider>
      <AuthProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Head>
            <title>Expoflamenco Analytics</title>
            <meta name="description" content="Analytics dashboard for Expoflamenco authors and contributors." />
            <meta property="og:title" content="Expoflamenco Analytics" />
            <meta property="og:description" content="Personal analytics dashboard for Expoflamenco authors and contributors." />
            <meta property="og:image" content="/images/EF512.png" />
            <link rel="icon" href="/images/EF512.png" />
          </Head>
          <AppContent />
          <StatusBar style="auto" />
        </ThemeProvider>
      </AuthProvider>
    </TranslationProvider>
  );
}
