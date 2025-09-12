import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Head from 'expo-router/head';

import { useColorScheme } from '@/hooks/useColorScheme';

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
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Head>
        <title>Expoflamenco - Admin Panel</title>
        <meta name="description" content="Goblin is a groundbreaking new Expo capability that lets managers stealthily unlock and seize high-value data intelligence." />
        <meta property="og:title" content="Expoflamenco - Admin Panel" />
        <meta property="og:description" content="Goblin is a groundbreaking new Expo capability that lets managers stealthily unlock and seize high-value data intelligence." />
        <meta property="og:image" content="/images/EF512.png" />
        <link rel="icon" href="/images/EF512.png" />
      </Head>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
