// The Clinician pipeline (ported from POC 7, validated): preScan → RAG → MedGemma
// (few-shot banding rubric + JSON-schema output) → deterministic Guardian.
// Never diagnoses, never doses. The band is a proposal; the Guardian can only upgrade it.
import { completion } from "@qvac/sdk";
import { Pet, TimelineEvent } from "@/data/types";
import { getClinician } from "./models";
import { ingestPetRecord, searchPetRecord, citedIds } from "./rag";
import { preScan, guardianReview, Band } from "./guardian";
import { auditInference } from "./audit";

const CLINICIAN_SYSTEM = `You are the clinical reasoning component of a pet-owner's record-keeping app.
You are NOT a veterinarian and you do NOT diagnose. You help an owner decide how urgently to seek
veterinary care and what to tell their vet.
HARD RULES:
- Never state a definitive diagnosis. Never give a drug or a dose.
- Reason ONLY from the CONTEXT provided (the pet's own record) and the owner's current message.
- Do NOT invent or assume symptoms. Only mention a symptom (e.g. off food, vomiting, lethargy) if it
  appears in the CONTEXT or the owner stated it now. If a sign is not mentioned, do not claim it.
- Cite the [eN] ids you used. When unsure, choose the MORE cautious band.
BANDING RUBRIC (choose by URGENCY, not worst-case; a serious HISTORY alone does not raise the band):
- home_monitor: minor, self-limiting, otherwise well.
- vet_soon: persistent/worsening, repeated vomiting, limp >1 day, off food, PU/PD, likely infection.
- vet_urgent: bloat signs, blocked-cat urinary, collapse, seizure, dyspnea, pale gums, toxin, bleeding.
Output JSON only. Your band is a PROPOSAL; a safety layer may upgrade it, never lower it.`;

const BAND_SCHEMA = {
  type: "object",
  properties: {
    band: { type: "string", enum: ["home_monitor", "vet_soon", "vet_urgent"] },
    rationale: { type: "string" },
    ask_your_vet: { type: "array", items: { type: "string" } },
    cited_event_ids: { type: "array", items: { type: "string" } },
    confidence: { type: "number" },
  },
  required: ["band", "rationale", "ask_your_vet", "cited_event_ids", "confidence"],
  additionalProperties: false,
} as const;

export interface TriageResult {
  band: Band;
  rationale: string;
  askYourVet: string[];
  citedIds: string[];
  redFlagBoxes: string[];
  upgraded: boolean;
  instant: boolean; // true = deterministic Guardian fired before any model ran
}

const signalment = (p: Pet) =>
  [p.species, p.breed, p.ageLabel, p.weightKg && `${p.weightKg} kg`, ...(p.riskFlags ?? [])].filter(Boolean).join(", ");

export type AskMode = "triage" | "diagnosis";

const DIAGNOSIS_SYSTEM = `You are helping a pet owner UNDERSTAND something their vet already told them.
You are NOT a vet and you do NOT diagnose or re-triage. Explain the vet's terms in plain language,
cross-check against the pet's record (cite [eN]), and list good questions to ask at the next visit.
HARD RULES:
- Never contradict or overturn the vet. Never give a drug or a dose.
- Reason ONLY from the CONTEXT provided. When unsure, say so.
- Set band to home_monitor unless the record itself shows an urgent sign; a safety layer may upgrade it.
Output JSON only.`;

export async function runTriage(pet: Pet, events: TimelineEvent[], question: string, mode: AskMode = "triage"): Promise<TriageResult> {
  // 1) Deterministic pre-scan — toxins/crises trip an instant URGENT, no model wait (I8).
  const pre = preScan(question, pet);
  if (pre.trip) {
    // Route through the Guardian too, so the band is never trusted raw (defense in depth).
    const guarded = guardianReview({ band: pre.band, confidence: 1 }, pet, pre);
    return {
      band: guarded.band, rationale: pre.reason ?? "", askYourVet: [],
      citedIds: [], redFlagBoxes: pre.reason ? [pre.reason, ...guarded.redFlagBoxes] : guarded.redFlagBoxes,
      upgraded: true, instant: true,
    };
  }

  // 2) Retrieve from the pet's own record (I4).
  await ingestPetRecord(pet.id, events);
  const hits = await searchPetRecord(pet.id, question, 4);
  const ctx = hits.map((h) => h.content).join("\n");

  // 3) Reason — MedGemma grounded only on retrieved context, structured output.
  const system = mode === "diagnosis" ? DIAGNOSIS_SYSTEM : CLINICIAN_SYSTEM;
  const modelId = await getClinician();
  const t0 = Date.now();
  const run = completion({
    modelId,
    history: [
      { role: "system", content: `${system}\nThe pet is a ${signalment(pet)}. Reason for THIS animal.` },
      { role: "user", content: `CONTEXT (retrieved from this pet's record):\n${ctx}\n\nOWNER ${mode === "diagnosis" ? "WANTS TO UNDERSTAND" : "QUESTION"}: ${question}\n\nReturn the JSON.` },
    ],
    stream: false,
    responseFormat: { type: "json_schema", json_schema: { name: "triage", schema: BAND_SCHEMA, strict: true } },
  });
  const final = await run.final;
  const totalMs = Date.now() - t0;
  let draft: any = {};
  try { draft = JSON.parse(final.contentText ?? "{}"); } catch { /* malformed → guardian floors up (I5) */ }

  // 4) Guard — deterministic floor/upgrade + dose strip over ALL owner-facing fields.
  const guarded = guardianReview(
    { band: draft.band, rationale: draft.rationale, confidence: draft.confidence,
      askYourVet: Array.isArray(draft.ask_your_vet) ? draft.ask_your_vet : [] },
    pet, pre
  );

  // Audit the inference perf (prompt, tokens, TTFT, tokens/sec, device) from the SDK stats.
  auditInference({ prompt: question, band: guarded.band, totalMs, stats: (final as any).stats });

  return {
    band: guarded.band,
    rationale: guarded.rationale,
    askYourVet: guarded.askYourVet,
    citedIds: Array.isArray(draft.cited_event_ids) && draft.cited_event_ids.length ? draft.cited_event_ids : citedIds(hits),
    redFlagBoxes: guarded.redFlagBoxes,
    upgraded: guarded.upgraded,
    instant: false,
  };
}
