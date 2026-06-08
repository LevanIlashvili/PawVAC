// Per-kind field specs for the manual Add-Event form. UI phase: drives which inputs render.
import { EventKind } from "@/data/types";

export interface KindField {
  key: string;
  label: string;
  placeholder?: string;
  numeric?: boolean;
  multiline?: boolean;
}

export const KIND_LABEL: Record<EventKind, string> = {
  weight: "Weight",
  symptom: "Symptom",
  meal: "Meal",
  note: "Note",
  medication: "Medication",
  vaccine: "Vaccine",
  vet_visit: "Vet visit",
  lab_result: "Lab result",
  document: "Document",
  triage: "Triage",
};

// The 8 manual kinds offered in the picker (document/triage are AI-created, not manual).
export const MANUAL_KINDS: EventKind[] = [
  "weight", "symptom", "meal", "note", "medication", "vaccine", "vet_visit", "lab_result",
];

const FIELDS: Partial<Record<EventKind, KindField[]>> = {
  weight: [{ key: "kg", label: "Weight (kg)", placeholder: "e.g. 50", numeric: true }],
  symptom: [
    { key: "description", label: "What did you notice?", placeholder: "e.g. limping rear-left", multiline: true },
    { key: "bodyPart", label: "Body part (optional)", placeholder: "e.g. rear-left limb" },
  ],
  meal: [{ key: "description", label: "Food / reaction", placeholder: "e.g. new kibble, mild loose stool", multiline: true }],
  note: [{ key: "text", label: "Note", placeholder: "Anything worth remembering", multiline: true }],
  medication: [
    { key: "drug", label: "Drug", placeholder: "e.g. clindamycin" },
    { key: "route", label: "Route", placeholder: "e.g. oral" },
    { key: "doseTextVerbatim", label: "Dose as written (optional)", placeholder: 'e.g. "150mg BID"' },
  ],
  vaccine: [
    { key: "name", label: "Vaccine", placeholder: "e.g. Rabies booster" },
    { key: "date", label: "Date", placeholder: "YYYY-MM-DD" },
  ],
  vet_visit: [
    { key: "reason", label: "Reason", placeholder: "e.g. limp + off food" },
    { key: "note", label: "Findings / next steps", placeholder: "What the vet said", multiline: true },
  ],
  lab_result: [
    { key: "panel", label: "Panel", placeholder: "e.g. CBC" },
    { key: "note", label: "Values / notes", placeholder: "e.g. WBC 14.2 (ref 6-17)", multiline: true },
  ],
};

export const kindFields = (k: EventKind): KindField[] => FIELDS[k] ?? [{ key: "text", label: "Details", multiline: true }];
