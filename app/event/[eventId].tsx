import { Text, View } from "react-native";
import { colors } from "@/ui/theme";
export default function EventDetail() {
  return <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.bg }}><Text style={{ color: colors.muted }}>event detail</Text></View>;
}
