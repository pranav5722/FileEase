import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { Platform } from "react-native";
import { useSettingsStore } from "../store/settingsStore";
import { ErrorBoundary } from "./error-boundary";
import colors from "../constants/colors";
import * as LocalAuthentication from "expo-local-authentication";
import PinModal from "../components/PinModal";

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    ...FontAwesome.font,
  });
  
  const router = useRouter();
  const segments = useSegments();
  const { firstLaunch, darkMode, appLockEnabled, pin, useBiometrics } = useSettingsStore();
  const [showPinModal, setShowPinModal] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  useEffect(() => {
    if (error) {
      console.error(error);
      throw error;
    }
  }, [error]);
  
  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
      
      // Check if it's the first launch and redirect to intro
      if (firstLaunch && segments[0] !== 'intro') {
        router.replace('/intro');
      } else if (appLockEnabled && !isAuthenticated) {
        // App lock is enabled and user is not authenticated
        authenticateUser();
      }
    }
  }, [loaded, firstLaunch, segments, appLockEnabled]);
  
  const authenticateUser = async () => {
    if (useBiometrics && Platform.OS !== 'web') {
      try {
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: 'Authenticate to access FileEase',
          fallbackLabel: 'Use PIN',
        });
        
        if (result.success) {
          setIsAuthenticated(true);
        } else if (pin) {
          setShowPinModal(true);
        }
      } catch (error) {
        console.error('Authentication error:', error);
        if (pin) {
          setShowPinModal(true);
        }
      }
    } else if (pin) {
      setShowPinModal(true);
    } else {
      // No security set up, allow access
      setIsAuthenticated(true);
    }
  };
  
  const handlePinSuccess = () => {
    setIsAuthenticated(true);
    setShowPinModal(false);
  };
  
  if (!loaded || (appLockEnabled && !isAuthenticated)) {
    // Show only the PIN modal if app lock is enabled and not authenticated
    if (showPinModal) {
      return (
        <PinModal
          visible={showPinModal}
          onClose={() => {}} // Don't allow closing without authentication
          onSuccess={handlePinSuccess}
        />
      );
    }
    return null;
  }
  
  return (
    <ErrorBoundary>
      <RootLayoutNav />
    </ErrorBoundary>
  );
}

function RootLayoutNav() {
  const darkMode = useSettingsStore(state => state.darkMode);
  const theme = darkMode ? colors.dark : colors.light;
  
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.card,
        },
        headerTintColor: theme.text,
        headerBackTitle: "Back",
        contentStyle: {
          backgroundColor: theme.background,
        },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="intro" options={{ headerShown: false }} />
      <Stack.Screen name="file-viewer" options={{ title: "File Viewer" }} />
      <Stack.Screen name="folder-picker" options={{ title: "Select Folder" }} />
    </Stack>
  );
}