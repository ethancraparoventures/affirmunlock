import { Redirect } from "expo-router";
import { useAppContext } from "@/lib/app-context";
import { View, ActivityIndicator } from "react-native";

/**
 * Root entry point — decides where to send the user on first load:
 * - Not yet onboarded → /onboarding
 * - Locked today → /lock
 * - Otherwise → /(tabs)
 */
export default function RootIndex() {
  const { settings, appState, isLoading } = useAppContext();

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#F7F3EC" }}>
        <ActivityIndicator color="#7A9E7E" />
      </View>
    );
  }

  if (!settings.onboardingComplete) {
    return <Redirect href="/onboarding" />;
  }

  if (appState.isLocked) {
    return <Redirect href="/lock" />;
  }

  return <Redirect href="/(tabs)" />;
}
