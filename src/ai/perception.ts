// Perception: voice → transcript (Whisper) and document → text (OCR), ported from POC 12.
// These feed the confirm gate; the parsed events are written only after the user confirms.
import { transcribe, ocr } from "@qvac/sdk";
import { getAsr, getOcr } from "./models";

/** Transcribe a recorded audio clip (file uri / blob accepted by the SDK as audioChunk). */
export async function transcribeAudio(audioChunk: unknown): Promise<string> {
  const modelId = await getAsr();
  const text = await transcribe({ modelId, audioChunk } as any);
  return typeof text === "string" ? text : String(text ?? "");
}

/** OCR a captured document image → concatenated text blocks. */
export async function scanDocument(image: unknown): Promise<string> {
  const modelId = await getOcr();
  const { blocks } = ocr({ modelId, image } as any);
  const result = (await blocks) as Array<{ text: string }> | undefined;
  return (result ?? []).map((b) => b.text).join(" ");
}
