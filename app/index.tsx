import { Redirect } from "expo-router";
import { PETS } from "@/data/mock";

export default function Index() {
  // UI phase: always have mock pets → land on the first pet's Timeline.
  // (When data binds, this redirects to /welcome when there are no pets.)
  if (PETS.length === 0) return <Redirect href="/welcome" />;
  return <Redirect href={`/pet/${PETS[0].id}`} />;
}
