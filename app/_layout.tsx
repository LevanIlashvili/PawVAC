import { Stack } from "expo-router";
import { View, ActivityIndicator } from "react-native";
import {
  useFonts,
  Montserrat_400Regular,
  Montserrat_500Medium,
  Montserrat_600SemiBold,
  Montserrat_700Bold,
} from "@expo-google-fonts/montserrat";
import { colors } from "@/ui/theme";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Montserrat_400Regular,
    Montserrat_500Medium,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.bg }}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="add-pet" options={{ presentation: "modal" }} />
      <Stack.Screen name="add-event" options={{ presentation: "modal" }} />
      <Stack.Screen name="voice" options={{ presentation: "modal" }} />
      <Stack.Screen name="scan" options={{ presentation: "modal" }} />
      <Stack.Screen name="confirm" options={{ presentation: "modal" }} />
      <Stack.Screen name="settings" options={{ presentation: "modal" }} />
      <Stack.Screen name="pack" />
      <Stack.Screen name="event/[eventId]" />
      <Stack.Screen name="welcome" />
    </Stack>
  );
}
