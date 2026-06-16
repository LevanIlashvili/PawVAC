// Model load manager. Lazy-loads QVAC models on first use, caches the modelId, and picks
// a clinician model by available RAM (POC 11 tiering: 4B needs ~3GB+, else fall back small).
// Loads are serialized (RF-6: SDK single-instance cache lock).
import {
  loadModel,
  type ModelProgressUpdate,
  MEDGEMMA_4B_IT_Q4_1,
  QWEN3_1_7B_INST_Q4,
  EMBEDDINGGEMMA_300M_Q8_0,
  WHISPER_TINY,
  OCR_LATIN_RECOGNIZER_1,
  OCR_CRAFT_DETECTOR,
} from "@qvac/sdk";

type Role = "clinician" | "embeddings" | "asr" | "ocr";
type Progress = (p: ModelProgressUpdate) => void;

const cache: Partial<Record<Role, string>> = {};
let chain: Promise<unknown> = Promise.resolve();

// Serialize loads so two screens don't race the SDK cache lock.
function serialize<T>(fn: () => Promise<T>): Promise<T> {
  const next = chain.then(fn, fn);
  chain = next.catch(() => {});
  return next;
}

/** Clinician model: MedGemma-4B where RAM allows, else the smaller Qwen3-1.7B (POC 11 tiering). */
async function pickClinicianSrc() {
  // expo-device gives total RAM; if unavailable, assume capable (phone target).
  try {
    const Device = await import("expo-device");
    const ram = (Device as { totalMemory?: number }).totalMemory; // bytes
    if (typeof ram === "number" && ram < 4 * 1024 ** 3) return QWEN3_1_7B_INST_Q4;
  } catch { /* expo-device not present → assume capable */ }
  return MEDGEMMA_4B_IT_Q4_1;
}

export async function getClinician(onProgress?: Progress): Promise<string> {
  if (cache.clinician) return cache.clinician;
  return serialize(async () => {
    if (cache.clinician) return cache.clinician;
    const modelSrc = await pickClinicianSrc();
    const id = await loadModel({ modelSrc, modelType: "llm", modelConfig: { ctx_size: 4096 }, onProgress });
    cache.clinician = id;
    return id;
  });
}

export async function getEmbeddings(onProgress?: Progress): Promise<string> {
  if (cache.embeddings) return cache.embeddings;
  return serialize(async () => {
    if (cache.embeddings) return cache.embeddings;
    const id = await loadModel({ modelSrc: EMBEDDINGGEMMA_300M_Q8_0, modelType: "llamacpp-embedding", onProgress });
    cache.embeddings = id;
    return id;
  });
}

export async function getAsr(onProgress?: Progress): Promise<string> {
  if (cache.asr) return cache.asr;
  return serialize(async () => {
    if (cache.asr) return cache.asr;
    const id = await loadModel({ modelSrc: WHISPER_TINY, modelType: "whisper", onProgress });
    cache.asr = id;
    return id;
  });
}

export async function getOcr(onProgress?: Progress): Promise<string> {
  if (cache.ocr) return cache.ocr;
  return serialize(async () => {
    if (cache.ocr) return cache.ocr;
    // OCR is a 2-stage pipeline: recognizer (modelSrc) + CRAFT detector (POC 12).
    const id = await loadModel({
      modelSrc: OCR_LATIN_RECOGNIZER_1,
      modelType: "ocr",
      modelConfig: { langList: ["en"], pipelineMode: "easyocr", recognizerBatchSize: 1, detectorModelSrc: OCR_CRAFT_DETECTOR },
      onProgress,
    });
    cache.ocr = id;
    return id;
  });
}
