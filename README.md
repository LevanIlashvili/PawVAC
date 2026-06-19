# PawVac

[![platform](https://img.shields.io/badge/platform-Android-3ddc84.svg?style=flat-square)](#requirements)
[![runtime](https://img.shields.io/badge/Expo-SDK%2056-000020.svg?style=flat-square)](https://docs.expo.dev/versions/v56.0.0/)
[![AI](https://img.shields.io/badge/AI-on--device%20(QVAC)-E8853F.svg?style=flat-square)](#how-pawvac-uses-the-qvac-sdk)
[![license](https://img.shields.io/badge/license-Apache--2.0-blue.svg?style=flat-square)](./LICENSE)

**Note:** Prototype / hackathon build. The on-device clinician assists owners in deciding *how urgently*
to seek veterinary care and *what to tell their vet* — it is **not** a veterinarian, does not diagnose, and
never gives a dose. Treat its output as triage guidance, not medical advice.

A **local-first, offline pet-health app**. Everything — your pet's record, the AI that reasons over it,
the embeddings memory, the safety logic — runs **on the phone**. No account, no cloud, nothing leaves the
device unless you explicitly share it. The medical brain is [QVAC](https://docs.tether.io/qvac)'s on-device
inference: `MedGemma-4B` for clinical reasoning, `EmbeddingGemma` for record retrieval, `Whisper` for voice
notes, and OCR for documents — all gated by a **deterministic safety layer** the model cannot reason around.

---

## Table of contents

- [What it does](#what-it-does)
- [Why on-device](#why-on-device)
- [Models](#models)
- [How PawVac uses the QVAC SDK](#how-pawvac-uses-the-qvac-sdk)
- [Safety model](#safety-model)
- [Architecture](#architecture)
- [Requirements](#requirements)
- [Reproducing the build (Android)](#reproducing-the-build-android)
- [Running](#running)
- [Project layout](#project-layout)
- [Development](#development)
- [Known limitations](#known-limitations)
- [License](#license)

---

## What it does

- **Per-pet medical record** — append-only timeline of events (symptoms, vet visits, labs, meds, vaccines,
  weights, notes), with provenance (voice / scan / manual / AI) on every entry.
- **Ask** — "Should I worry?" runs an on-device clinician over *that pet's* record and returns a banded
  answer (`MONITOR AT HOME` / `SEE A VET SOON` / `URGENT`), a grounded rationale, red-flag boxes, and
  questions to ask the vet. A second mode, "Understand a diagnosis," explains vet terminology without re-triaging.
- **Voice notes** → on-device Whisper transcript → structured event (via a confirm gate).
- **Document scan** → on-device OCR → structured event.
- **Reminders** — meds / vaccines, with snooze & done.
- **Calendar dashboard** — a cross-pet month view with per-pet color-coded events + a daily agenda.
- **Vet Visit Pack** — a one-tap summary built from the real record, exportable as a PDF via the native share sheet.

## Why on-device

Pet-health data is private, and a vet-triage assistant must work in a clinic basement with no signal.
PawVac never sends the record or the query anywhere — model load, RAG, and inference all happen locally
through QVAC's Bare-runtime native engines. The only network use is the **one-time model download** on first
run (cached thereafter); the deterministic safety layer needs no network and no model at all.

---

## Models

All models are QVAC registry entries, downloaded on first `loadModel` and cached on the device. PawVac
references them as named constants exported from `@qvac/sdk`:

| Role | Constant | Model | Size (Q) | Used for |
|------|----------|-------|----------|----------|
| Clinician | `MEDGEMMA_4B_IT_Q4_1` | Google MedGemma-4B-IT | ~2.6 GB (Q4_1) | Banded triage reasoning over the pet's record |
| Clinician (fallback) | `QWEN3_1_7B_INST_Q4` | Qwen3-1.7B-Instruct | ~1.1 GB (Q4) | Used automatically when device RAM < 4 GB |
| Embeddings | `EMBEDDINGGEMMA_300M_Q8_0` | EmbeddingGemma-300M | ~0.3 GB (Q8) | RAG over the per-pet record (Invariant I4) |
| ASR | `WHISPER_TINY` | Whisper tiny | small | Voice-note transcription |
| OCR (recognizer) | `OCR_LATIN_RECOGNIZER_1` | EasyOCR latin recognizer | small | Document text recognition |
| OCR (detector) | `OCR_CRAFT_DETECTOR` | CRAFT text detector | small | Text-region detection (2-stage OCR pipeline) |

> MedGemma is a **human** medical model; PawVac uses it for *urgency banding and questions-to-ask*, not
> species-specific diagnosis, and floors every output through the Guardian (below). A genuinely veterinary
> open model wasn't available at downloadable quality at build time (see `../poc/VET-LLM-RESEARCH.md`).

---

## How PawVac uses the QVAC SDK

`@qvac/sdk` (v0.13.5) exposes the on-device engines as plain async functions. All usage is isolated in
`src/ai/`. The exact call shapes:

**Load (lazy, RAM-tiered, serialized to respect the SDK's single-instance cache lock)** — `src/ai/models.ts`:
```ts
import { loadModel, MEDGEMMA_4B_IT_Q4_1, QWEN3_1_7B_INST_Q4,
         EMBEDDINGGEMMA_300M_Q8_0, WHISPER_TINY,
         OCR_LATIN_RECOGNIZER_1, OCR_CRAFT_DETECTOR } from "@qvac/sdk"

// clinician — MedGemma where RAM allows, else Qwen3 (Device.totalMemory)
const id = await loadModel({ modelSrc, modelType: "llm", modelConfig: { ctx_size: 4096 }, onProgress })

// embeddings (note: "llamacpp-embedding", not the deprecated "embeddings")
await loadModel({ modelSrc: EMBEDDINGGEMMA_300M_Q8_0, modelType: "llamacpp-embedding" })

// whisper
await loadModel({ modelSrc: WHISPER_TINY, modelType: "whisper" })

// OCR is a 2-stage pipeline: recognizer (modelSrc) + CRAFT detector (modelConfig)
await loadModel({ modelSrc: OCR_LATIN_RECOGNIZER_1, modelType: "ocr",
  modelConfig: { langList: ["en"], pipelineMode: "easyocr", detectorModelSrc: OCR_CRAFT_DETECTOR } })
```

**RAG over the pet's record** — `src/ai/rag.ts`:
```ts
import { ragIngest, ragSearch } from "@qvac/sdk"
await ragIngest({ modelId: embId, workspace: `pet:${petId}`, documents, chunk: true })
const hits = await ragSearch({ modelId: embId, workspace: `pet:${petId}`, query, topK: 4 })
// each event is ingested tagged "[eN] date: kind — summary" so the model can cite [eN]
```

**Clinician completion (grounded, structured JSON output)** — `src/ai/clinician.ts`:
```ts
import { completion } from "@qvac/sdk"
const run = completion({
  modelId,
  history: [ { role: "system", content: CLINICIAN_SYSTEM }, { role: "user", content: ctx + question } ],
  stream: false,
  responseFormat: { type: "json_schema", json_schema: { name: "triage", schema: BAND_SCHEMA, strict: true } },
})
const final = await run.final            // → { contentText, toolCalls, ... }
const draft = JSON.parse(final.contentText)   // { band, rationale, ask_your_vet, cited_event_ids, confidence }
```

**Perception** — `src/ai/perception.ts`:
```ts
import { transcribe, ocr } from "@qvac/sdk"
const text = await transcribe({ modelId, audioChunk })     // voice → transcript
const { blocks } = ocr({ modelId, image })                 // document image → text blocks
```

### Audit log

Every model **load/unload** and every **inference** is recorded as a structured JSON-lines entry
(`src/ai/audit.ts`), persisted on-device and exportable from **Settings → Export AI audit log**. Inference
entries carry the SDK's `CompletionFinal.stats`: the prompt, `promptTokens` / `generatedTokens`,
**time-to-first-token**, **tokens/sec**, the backend device (cpu/gpu), the resolved triage band, and total
wall-clock. Example line from a real demo run:
```json
{"ts":"2026-06-…","kind":"model_load","role":"clinician","model":"MEDGEMMA_4B_IT_Q4_1","loadMs":8707}
{"ts":"2026-06-…","kind":"inference","prompt":"Toby has a limp, should I worry","band":"vet_soon",
 "promptTokens":612,"generatedTokens":188,"timeToFirstTokenMs":4120,"tokensPerSecond":2.6,
 "backendDevice":"cpu","totalMs":75029}
```

**Native side.** QVAC ships its inference engines as Bare-runtime native libs (`*.bare`) bridged through
`react-native-bare-kit`, and an Expo config plugin (`@qvac/sdk/expo-plugin`) that wires the NDK version,
arm64 ABI, and OpenCL packaging. Because of this, PawVac runs as a **dev-client / standalone build, not in
Expo Go** (Expo Go has no custom native modules). QVAC is **arm64-only** — there is no x86 prebuild.

---

## Safety model

The clinician's verdict is never trusted raw. A deterministic Guardian (`src/ai/guardian.ts`, unit-tested in
`src/ai/guardian.test.ts`) wraps every result and enforces:

- **Monotonic band (I8)** — the model's band is a *proposal*; the Guardian can only **upgrade** it, never downgrade.
- **Uncertainty rounds up (I5)** — low confidence, an armed tripwire, or a missing/invalid model band all
  floor to at least `SEE A VET SOON`. A failed/empty model response can never render `MONITOR AT HOME`.
- **Deterministic toxins & crises** — chocolate, xylitol, grapes, alliums, human NSAIDs/paracetamol, lilies
  (cats), antifreeze, rodenticide (species-matched; unknown species rounds up), plus crisis keywords
  (collapse, seizure, dyspnea, bloat, blocked-cat straining…) trip an **instant `URGENT` with no model call**.
- **No model-generated dose ever shown** — a global regex strips every dose from both the rationale and the
  "ask your vet" list. Stored doses are only ever the owner-confirmed verbatim text.
- **Breed tripwires** — deep-chested dog + off-food/retching → bloat (GDV) red-flag; male cat + straining → urinary-blockage red-flag.
- **No fabrication** — the clinician prompt forbids asserting any symptom not present in the record or the owner's message.

---

## Architecture

```
UI (expo-router, one app-level tab bar)
   Home · Pets · Ask · Reminders · Calendar   +  modal screens (add-pet/event, voice, scan, confirm, pack, settings)
        │  selector hooks (re-run on store `rev`)
        ▼
Store (zustand)  ── actions ──▶  Repo (DAL)  ──▶  SQLite (expo-sqlite, append-only event log, schema v2)
        │
        ▼
AI service (src/ai)
   preScan (deterministic) ─▶ RAG (EmbeddingGemma) ─▶ MedGemma-4B (JSON) ─▶ Guardian (floor/upgrade, dose-strip)
                                                              via @qvac/sdk → react-native-bare-kit (native, arm64)
```

Data flow is one-directional: screens read through store selectors; writes go store → repo → SQLite, then
bump a `rev` counter that re-runs the selectors. The **event log is append-only** — corrections insert a
superseding row and deletes insert a hidden tombstone; the original is never mutated (audit trail / I3).

---

## Requirements

- **Node** ≥ 20, **npm**
- **macOS or Linux** with the Android toolchain: **JDK 21** (Temurin), Android SDK, **NDK 29**
- An **arm64 Android device** (real phone or arm64 emulator image). x86 emulators **cannot** load QVAC.
- **~3 GB free RAM** on the device for MedGemma-4B (otherwise it auto-falls-back to Qwen3-1.7B)
- ~3 GB free storage for the cached models

---

## Reproducing the build (Android)

PawVac needs a native dev-client build. The toolchain has two RN-0.85 / QVAC quirks that the steps below pin.

```bash
# 1. install (RN 0.85 + QVAC have strict peers; --legacy-peer-deps is expected)
npm install --legacy-peer-deps

# 2. generate the native project (applies the QVAC expo plugin, SQLite, audio, image-picker, etc.)
npx expo prebuild --platform android --no-install

# 3. apply the two required patches to the generated android/ tree:
#    a) Gradle 8.13 — RN 0.85 ships foojay 0.5.0, which is incompatible with Gradle 9.x
sed -i '' 's|gradle-9.[0-9.]*-bin.zip|gradle-8.13-bin.zip|' android/gradle/wrapper/gradle-wrapper.properties
#    b) make OpenCL optional so it installs on devices without it
sed -i '' 's|<uses-native-library android:name="libOpenCL.so"/>|<uses-native-library android:name="libOpenCL.so" android:required="false"/>|' android/app/src/main/AndroidManifest.xml

# 4. build the debug APK
cd android
JAVA_HOME=<path-to-temurin-21> ./gradlew :app:assembleDebug --no-daemon -x lint
cd ..

# 5. install on a connected arm64 device  (adb devices to find <id>)
adb -s <id> install -r android/app/build/outputs/apk/debug/app-debug.apk
```

> `android/` is git-ignored (regenerated by prebuild) — re-apply step 3 after any `prebuild`.
> Build constants used here: Expo SDK 56, RN 0.85.3, minSdkVersion 29, NDK 29, Gradle 8.13, JDK 21.

## Running

```bash
# serve the JS bundle to the installed dev-client
npx expo start --dev-client
# then open the app on the device; if the device can't reach your LAN, reverse the port:
adb -s <id> reverse tcp:8081 tcp:8081
```

First Ask triggers the MedGemma-4B download (~2.6 GB, cached afterward). A toxin query
(e.g. *"he ate chocolate"*) returns instantly with **no** model — it's the deterministic path.

On first launch the database is seeded with a sample pet (`src/data/mock.ts`). Bumping `SEED_VERSION` in
`src/db/schema.ts` wipes + reseeds existing installs.

---

## Project layout

```
app/                 screens (expo-router file routes)
  (tabs)/            Home · Pets · Ask · Reminders · Calendar
src/
  ai/                guardian · clinician · models · rag · perception   (all @qvac/sdk usage)
  db/                schema (DDL + migrations) · repo (DAL) · seed
  store/             zustand store over the repo
  data/              domain types + seed fixtures
  ui/                design system (theme, type, icons, primitives, screen shells, cards)
assets/              app icon set (paw mark)
BUILD.md             the native build recipe (detailed)
../poc/              specs, POC findings, SDK reference, and BUILT.md (implementation status)
```

## Development

```bash
npm install --legacy-peer-deps
npm run typecheck     # tsc --noEmit
npm test              # jest (incl. the Guardian safety suite)
npm start             # metro / dev-client
```

## Known limitations

- **Clinician latency** — MedGemma-4B (Q4) on a phone CPU is ~60–90 s per query. Usable, not snappy;
  a smaller model or NNAPI/GPU delegation is the path to speed.
- **Reminders** are stored and shown but not yet wired to OS notification scheduling.
- **Capture media** (the original audio/photo) isn't persisted yet — only the derived text/event is.
- Voice→Whisper and Scan→OCR are wired end-to-end but have had less device testing than the Ask path.
- Co-owner P2P sync and on-device LoRA are POC-proven (`../poc/FINDINGS.md`) but not in the app.

## License

Apache-2.0 — see [LICENSE](./LICENSE). © 2026 Levan Ilashvili.
