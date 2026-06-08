// Welcome / first-run — shown when there are no pets yet. Entry point to add the first pet.
import { Text, View, StyleSheet } from "react-native";
import { router } from "expo-router";
import { Button } from "@/ui/primitives";
import { Icon } from "@/ui/icons";
import { colors } from "@/ui/theme";
import { type } from "@/ui/type";

export default function Welcome() {
  return (
    <View style={s.screen}>
      <View style={s.logo}><Icon name="paw" size={56} color={colors.accent} /></View>
      <Text style={s.title}>PawVac</Text>
      <Text style={s.tagline}>Your pet's health, private and on your phone.</Text>
      <Button title="Add your first pet" onPress={() => router.push("/add-pet")} style={s.cta} />
      <Text style={s.note}>Everything stays on this device · no account</Text>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg, alignItems: "center", justifyContent: "center", padding: 24 },
  logo: { width: 96, height: 96, borderRadius: 28, backgroundColor: colors.accentTint, alignItems: "center", justifyContent: "center", marginBottom: 16 },
  title: { ...type.display, color: colors.accent },
  tagline: { ...type.body, textAlign: "center", maxWidth: 240, marginTop: 6 },
  cta: { alignSelf: "stretch", marginTop: 28 },
  note: { ...type.caption, marginTop: 14 },
});
