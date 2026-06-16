// Per-pet RAG memory (Invariant I4). Ingests a pet's record into an embeddings workspace
// and retrieves the most relevant events to ground the clinician. (POC 3/7/8.)
import { ragIngest, ragSearch } from "@qvac/sdk";
import { getEmbeddings } from "./models";
import { TimelineEvent } from "@/data/types";

const workspaceFor = (petId: string) => `pet:${petId}`;
const ingested = new Set<string>(); // petId → already ingested this session

// Render an event as a retrievable line tagged with its id (so the model can cite [eN]).
const eventLine = (e: TimelineEvent) => `[${e.id}] ${e.dateLabel}: ${e.kind} — ${e.summary}`;

export async function ingestPetRecord(petId: string, events: TimelineEvent[]): Promise<void> {
  if (ingested.has(petId) || events.length === 0) return;
  const embId = await getEmbeddings();
  await ragIngest({ modelId: embId, workspace: workspaceFor(petId), documents: events.map(eventLine), chunk: true });
  ingested.add(petId);
}

export interface RagHit { id?: string; content: string; score: number }

export async function searchPetRecord(petId: string, query: string, topK = 4): Promise<RagHit[]> {
  const embId = await getEmbeddings();
  return (await ragSearch({ modelId: embId, workspace: workspaceFor(petId), query, topK })) as RagHit[];
}

/** Pull the cited event ids out of retrieved chunks. */
export const citedIds = (hits: RagHit[]): string[] =>
  hits.map((h) => (h.content.match(/\[(e\w+)\]/) || [])[1]).filter(Boolean) as string[];
