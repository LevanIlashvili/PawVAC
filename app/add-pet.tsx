// Add pet form — multi-species, breed, sex, age, weight, photo. Persists to SQLite via the store.
import { useState } from "react";
import { Alert, Image, Pressable, Text, View, StyleSheet } from "react-native";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
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
  const [photoUri, setPhotoUri] = useState<string | undefined>();

  const pickPhoto = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], quality: 0.8, allowsEditing: true, aspect: [1, 1] });
    if (!res.canceled && res.assets?.[0]?.uri) setPhotoUri(res.assets[0].uri);
  };

  const save = () => {
    if (!name.trim()) { Alert.alert("Name required", "Give your pet a name."); return; }
    const w = parseFloat(weight);
    addPet({
      name: name.trim(), species, breed: breed.trim() || undefined, sex,
      ageLabel: age.trim() || undefined,
      weightKg: Number.isFinite(w) ? w : undefined,
      riskFlags: [], color: PLACEHOLDER_COLOR, photoUri,
    });
    router.dismissAll();
  };

  return (
    <DetailScreen title="Add pet">
      <Pressable style={s.photo} onPress={pickPhoto}>
        {photoUri ? <Image source={{ uri: photoUri }} style={s.photoImg} /> : <Icon name="camera-plus" size={28} color={colors.muted} />}
      </Pressable>
      <Text style={s.photoHint}>{photoUri ? "change photo" : "add photo"}</Text>

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
  photo: { alignSelf: "center", width: 72, height: 72, borderRadius: 18, backgroundColor: colors.accentTint, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  photoImg: { width: "100%", height: "100%" },
  photoHint: { ...type.caption, textAlign: "center", marginTop: 4, marginBottom: 10 },
  label: { ...type.label, marginBottom: 6 },
  segRow: { flexDirection: "row", gap: 8, marginBottom: 12 },
});
