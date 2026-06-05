// Wraps the per-pet tab navigator with the persistent pet-switcher (top).
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Slot, useGlobalSearchParams } from "expo-router";
import { PetSwitcher } from "@/ui/PetSwitcher";
import { colors } from "@/ui/theme";

export default function PetLayout() {
  const { petId } = useGlobalSearchParams<{ petId?: string }>();
  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: colors.bg }}>
      <PetSwitcher activePetId={petId} />
      <View style={{ flex: 1 }}>
        <Slot />
      </View>
    </SafeAreaView>
  );
}
