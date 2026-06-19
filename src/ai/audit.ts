// Structured AI audit log. Records model load/unload and inference performance
// (prompt, prompt/generated tokens, time-to-first-token, tokens/sec, backend device)
// as JSON lines. Kept in memory (always available) and best-effort persisted to a file
// so a single demo run can be exported and inspected. On-device only.
import { File, Paths } from "expo-file-system";

export type AuditKind = "model_load" | "model_unload" | "inference";

export interface AuditEntry {
  ts: string;                 // ISO timestamp
  kind: AuditKind;
  // model lifecycle
  role?: string;              // "clinician" | "embeddings" | "asr" | "ocr"
  model?: string;            // resolved model name/src
  loadMs?: number;
  // inference perf (from CompletionFinal.stats)
  prompt?: string;            // the user question (truncated)
  promptTokens?: number;
  generatedTokens?: number;
  cacheTokens?: number;
  timeToFirstTokenMs?: number; // TTFT
  tokensPerSecond?: number;
  totalMs?: number;
  backendDevice?: string;     // cpu / gpu
  band?: string;              // resulting triage band (inference only)
  note?: string;
}

const LOG_FILE = "pawvac-audit.jsonl";
const ring: AuditEntry[] = [];
const MAX = 500;

async function persist(line: string): Promise<void> {
  try {
    const f = new File(Paths.document, LOG_FILE);
    if (!f.exists) f.create();
    // append-friendly: read existing + rewrite (small log; fine for a demo run)
    let prev = "";
    try { prev = await f.text(); } catch { /* new/empty file */ }
    f.write(prev + line + "\n");
  } catch {
    /* persistence is best-effort; the in-memory ring is the source of truth */
  }
}

export function audit(entry: Omit<AuditEntry, "ts">): AuditEntry {
  const full: AuditEntry = { ts: new Date().toISOString(), ...entry };
  ring.push(full);
  if (ring.length > MAX) ring.shift();
  void persist(JSON.stringify(full));   // fire-and-forget; ring is authoritative
  return full;
}

/** Pull the SDK CompletionFinal.stats into an inference audit entry. */
export function auditInference(args: {
  prompt: string; band?: string; totalMs: number; stats?: any;
}): void {
  const s = args.stats ?? {};
  audit({
    kind: "inference",
    prompt: args.prompt.slice(0, 200),
    band: args.band,
    promptTokens: s.promptTokens,
    generatedTokens: s.generatedTokens,
    cacheTokens: s.cacheTokens,
    timeToFirstTokenMs: s.timeToFirstToken,
    tokensPerSecond: s.tokensPerSecond,
    backendDevice: s.backendDevice,
    totalMs: Math.round(args.totalMs),
  });
}

export const auditEntries = (): AuditEntry[] => [...ring];

/** Path of the persisted JSONL file (for export/share), or null if not written. */
export function auditFileUri(): string | null {
  try {
    const f = new File(Paths.document, LOG_FILE);
    return f.exists ? f.uri : null;
  } catch {
    return null;
  }
}

export function clearAudit(): void {
  ring.length = 0;
  try { const f = new File(Paths.document, LOG_FILE); if (f.exists) f.delete(); } catch { /* noop */ }
}
