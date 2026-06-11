// Add pet form — multi-species, breed, sex, age, weight, photo placeholder.
// Persists to SQLite via the store; photo picker lands in a later phase.
import { useState } from "react";
import { Alert, Pressable, Text, View, StyleSheet } from "react-native";
import { router } from "expo-router";
import { Species } from "@/data/types";
import { useApp } from "@/store/app";
import { Button, Field, Pill } from "@/ui/primitives";
import { DetailScreen } from "@/ui/DetailScreen";
import { Icon } from "@/ui/icons";
import { colors } from "@/ui/theme";
import { type } from "@/ui/type";

const SPECIES: Species[] = ["dog", "cat", "other"];
const PLACEHOLDER_COLOR = "#E8853F";

export default function AddPet() {
  const addPet = useApp((s) => s.addPet);
  const [name, setName] = useState("");
  const [species, setSpecies] = useState<Species>("dog");
  const [breed, setBreed] = useState("");
  const [sex, setSex] = useState<"m" | "f" | undefined>();
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");

  const save = () => {
    if (!name.trim()) { Alert.alert("Name required", "Give your pet a name."); return; }
    addPet({
      name: name.trim(), species, breed: breed.trim() || undefined, sex,
      ageLabel: age.trim() || undefined,
      weightKg: weight ? Number(weight) : undefined,
      riskFlags: [], color: PLACEHOLDER_COLOR,
    });
    router.replace("/");
  };

  return (
    <DetailScreen title="Add pet">
      <Pressable style={s.photo} onPress={() => Alert.alert("Add photo", "Opens the camera / photo library. Wires up in Phase 2.")}>
        <Icon name="camera-plus" size={28} color={colors.muted} />
      </Pressable>
      <Text style={s.photoHint}>add photo</Text>

      <Field label="Name *" placeholder="e.g. Toby" value={name} onChangeText={setName} />

      <Text style={s.label}>Species *</Text>
      <View style={s.segRow}>
        {SPECIES.map((sp) => (
          <Pill key={sp} label={sp[0].toUpperCase() + sp.slice(1)} active={species === sp} onPress={() => setSpecies(sp)} />
        ))}
      </View>

      <Field label="Breed" placeholder="e.g. Rottweiler" value={breed} onChangeText={setBreed} />

      <Text style={s.label}>Sex</Text>
      <View style={s.segRow}>
        <Pill label="Male" active={sex === "m"} onPress={() => setSex(sex === "m" ? undefined : "m")} />
        <Pill label="Female" active={sex === "f"} onPress={() => setSex(sex === "f" ? undefined : "f")} />
      </View>

      <Field label="Age" placeholder="e.g. 7y" value={age} onChangeText={setAge} />
      <Field label="Weight (kg)" placeholder="e.g. 50" keyboardType="numeric" value={weight} onChangeText={setWeight} />

      <Button title="Save pet" onPress={save} style={{ marginTop: 6 }} />
    </DetailScreen>
  );
}

const s = StyleSheet.create({
  photo: { alignSelf: "center", width: 72, height: 72, borderRadius: 18, backgroundColor: colors.accentTint, alignItems: "center", justifyContent: "center" },
  photoHint: { ...type.caption, textAlign: "center", marginTop: 4, marginBottom: 10 },
  label: { ...type.label, marginBottom: 6 },
  segRow: { flexDirection: "row", gap: 8, marginBottom: 12 },
});
