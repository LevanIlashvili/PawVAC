// Deterministic Guardian (ported from poc/mini-pocs/guardian.mjs, validated 16/16 in POC 4).
// The safety floor: toxicity, crisis keywords, monotonic band upgrade, dose stripping.
// Model-independent by design (Invariants I5/I8) — the LLM cannot reason these away.
import { Pet } from "@/data/types";

export type Band = "home_monitor" | "vet_soon" | "vet_urgent";
export const BANDS: Band[] = ["home_monitor", "vet_soon", "vet_urgent"];
export const rank = (b: Band) => BANDS.indexOf(b);
export const maxBand = (a: Band, b: Band): Band => (rank(a) >= rank(b) ? a : b);

interface Toxin { match: RegExp; species: Pet["species"][]; name: string }
export const TOXINS: Toxin[] = [
  { match: /chocolate|cocoa|theobromine/i, species: ["dog", "cat"], name: "theobromine (chocolate)" },
  { match: /xylitol|sugar.?free gum/i, species: ["dog"], name: "xylitol" },
  { match: /grape|raisin/i, species: ["dog", "cat"], name: "grapes/raisins" },
  { match: /onion|garlic|chives|leek|allium/i, species: ["dog", "cat"], name: "alliums" },
  { match: /ibuprofen|naproxen|nsaid|paracetamol|acetaminophen|tylenol/i, species: ["dog", "cat"], name: "human NSAID/paracetamol" },
  { match: /antifreeze|ethylene glycol/i, species: ["dog", "cat"], name: "antifreeze" },
  { match: /rat ?poison|rodenticide|bromethalin/i, species: ["dog", "cat"], name: "rodenticide" },
];

export const CRISIS_KEYWORDS = /collapse|collapsed|seizure|seizing|convuls|can'?t breathe|not breathing|struggling to breathe|unconscious|won'?t wake|bloated belly|distended (and )?hard belly|hard,? swollen belly|can'?t (pee|urinate)|straining to (pee|urinate).*nothing|unproductive retch|pale gums|blue gums|profuse bleeding|hit by (a )?car/i;

export const DOSE_PATTERN = /\b\d+(\.\d+)?\s?(mg|ml|mcg|g|tablet|pill|cc)\b/i;

export interface PreScan {
  trip: boolean;
  band?: Band;
  reason?: string;
  kind?: "toxicity" | "crisis";
  tripwires: string[];
}

// Pre-scan: deterministic trip BEFORE the LLM ever runs (instant URGENT for toxins/crises).
export function preScan(input: string, pet: Pet): PreScan {
  for (const t of TOXINS) {
    if (t.match.test(input) && t.species.includes(pet.species))
      return { trip: true, band: "vet_urgent", reason: `toxic: ${t.name}`, kind: "toxicity", tripwires: [] };
  }
  if (CRISIS_KEYWORDS.test(input))
    return { trip: true, band: "vet_urgent", reason: "crisis keyword", kind: "crisis", tripwires: [] };

  const tripwires: string[] = [];
  const deepChested = pet.riskFlags?.some((f) => /deep.?chested/i.test(f));
  if (deepChested && /(off (his |her )?food|not eating|won'?t eat|declin\w* (breakfast|food|meal)|retch|distend|bloat)/i.test(input))
    tripwires.push("rule_out_GDV_bloat");
  if (pet.species === "cat" && pet.sex === "m" && /(litter|pee|urinat|strain)/i.test(input))
    tripwires.push("rule_out_urinary_blockage");
  return { trip: false, tripwires };
}

export interface ClinicianOut { band?: Band; rationale?: string; confidence?: number }

// Minimum band the rules demand regardless of the model (uncertainty rounds up — I5).
export function rulesMinBand(out: ClinicianOut, pre: PreScan): Band {
  let min: Band = "home_monitor";
  if (pre.tripwires.length) min = maxBand(min, "vet_soon");
  if ((out.confidence ?? 1) < 0.5) min = maxBand(min, "vet_soon");
  return min;
}

export interface GuardianResult {
  band: Band;
  rationale: string;
  redFlagBoxes: string[];
  violations: string[];
  upgraded: boolean;
}

// Post-process the Clinician output. Can only upgrade, never downgrade (I8).
export function guardianReview(out: ClinicianOut, pet: Pet, pre: PreScan): GuardianResult {
  const violations: string[] = [];
  let band: Band = out.band ?? "home_monitor";
  band = maxBand(band, rulesMinBand(out, pre));

  let rationale = out.rationale ?? "";
  if (DOSE_PATTERN.test(rationale)) {
    violations.push("dose_present_in_output");
    rationale = rationale.replace(DOSE_PATTERN, "[dose redacted — ask your vet]");
  }

  const redFlagBoxes = pre.tripwires.map((tw) => {
    if (tw === "rule_out_GDV_bloat")
      return "RULE OUT BLOAT (GDV): a deep-chested dog going off food can mask early bloat. Swollen/hard belly or unproductive retching = EMERGENCY, go now.";
    if (tw === "rule_out_urinary_blockage")
      return "RULE OUT URINARY BLOCKAGE: a male cat straining without producing urine can be a life-threatening blockage. If no urine is passing, go now.";
    return tw;
  });

  return { band, rationale, redFlagBoxes, violations, upgraded: band !== (out.band ?? "home_monitor") };
}
