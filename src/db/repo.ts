// Data-access layer over SQLite. Maps rows ↔ domain types and enforces the append-only
// event model: corrections insert a superseding row; "current" events exclude superseded ones.
import { db } from "./schema";
import { Pet, TimelineEvent, Reminder, CalendarItem, EventKind, EventSource, Species } from "@/data/types";

// Globally-unique id from a persistent monotonic sequence in the meta table — survives restarts
// and never collides across entity types (no Date.now()/Math.random() needed).
function genId(prefix: string): string {
  const d = db();
  const row = d.getFirstSync<{ value: string }>(`SELECT value FROM meta WHERE key = 'id_seq'`);
  const next = (row ? parseInt(row.value, 10) : 0) + 1;
  d.runSync(`INSERT OR REPLACE INTO meta (key, value) VALUES ('id_seq', ?)`, [String(next)]);
  return `${prefix}_${next}`;
}
function now(): number {
  return db().getFirstSync<{ t: number }>(`SELECT strftime('%s','now') AS t`)?.t ?? 0;
}

// ---- mappers ----
const toPet = (r: any): Pet => ({
  id: r.id, name: r.name, species: r.species as Species, breed: r.breed ?? undefined,
  sex: r.sex ?? undefined, ageLabel: r.age_label ?? undefined,
  weightKg: r.weight_kg ?? undefined, riskFlags: JSON.parse(r.risk_flags || "[]"), color: r.color,
  photoUri: r.photo_uri ?? undefined,
});
const toEvent = (r: any): TimelineEvent => ({
  id: r.id, petId: r.pet_id, kind: r.kind as EventKind, summary: r.summary,
  dateLabel: r.date_label, source: r.source as EventSource, confirmed: !!r.confirmed,
});
const toReminder = (r: any): Reminder => ({
  id: r.id, petId: r.pet_id, title: r.title, schedule: r.schedule,
  nextLabel: r.next_label, remainingLabel: r.remaining_label ?? undefined, done: !!r.done,
});
const toCalendarItem = (r: any): CalendarItem => ({
  id: r.id, petId: r.pet_id, date: r.date, kind: r.kind as EventKind,
  title: r.title, timeLabel: r.time_label ?? undefined, done: !!r.done,
});

// ---- pets ----
export const listPets = (): Pet[] => db().getAllSync(`SELECT * FROM pets ORDER BY created_at`).map(toPet);
export const getPet = (id: string): Pet | undefined => {
  const r = db().getFirstSync(`SELECT * FROM pets WHERE id = ?`, [id]);
  return r ? toPet(r) : undefined;
};
export function insertPet(p: Omit<Pet, "id">): string {
  const id = genId("p");
  db().runSync(
    `INSERT INTO pets (id,name,species,breed,sex,age_label,weight_kg,risk_flags,color,photo_uri,created_at)
     VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
    [id, p.name, p.species, p.breed ?? null, p.sex ?? null, p.ageLabel ?? null,
     p.weightKg ?? null, JSON.stringify(p.riskFlags ?? []), p.color, p.photoUri ?? null, now()]
  );
  return id;
}
export function updatePet(id: string, p: Partial<Omit<Pet, "id">>): void {
  const cur = getPet(id);
  if (!cur) return;
  const m = { ...cur, ...p };
  db().runSync(
    `UPDATE pets SET name=?,species=?,breed=?,sex=?,age_label=?,weight_kg=?,risk_flags=?,color=?,photo_uri=? WHERE id=?`,
    [m.name, m.species, m.breed ?? null, m.sex ?? null, m.ageLabel ?? null,
     m.weightKg ?? null, JSON.stringify(m.riskFlags ?? []), m.color, m.photoUri ?? null, id]
  );
}

// ---- events (append-only) ----
/** Current timeline for a pet = newest rows that are neither superseded nor tombstones. */
export const listEvents = (petId: string): TimelineEvent[] =>
  db().getAllSync(
    `SELECT * FROM events e
     WHERE e.pet_id = ?
       AND e.deleted = 0
       AND NOT EXISTS (SELECT 1 FROM events x WHERE x.supersedes = e.id)
     ORDER BY e.created_at DESC`,
    [petId]
  ).map(toEvent);

export const getEvent = (id: string): TimelineEvent | undefined => {
  const r = db().getFirstSync(`SELECT * FROM events WHERE id = ?`, [id]);
  return r ? toEvent(r) : undefined;
};

export function insertEvent(e: Omit<TimelineEvent, "id">, supersedes?: string, deleted = false): string {
  const id = genId("e");
  db().runSync(
    `INSERT INTO events (id,pet_id,kind,summary,date_label,source,confirmed,supersedes,deleted,created_at)
     VALUES (?,?,?,?,?,?,?,?,?,?)`,
    [id, e.petId, e.kind, e.summary, e.dateLabel, e.source, e.confirmed ? 1 : 0, supersedes ?? null, deleted ? 1 : 0, now()]
  );
  return id;
}

/** Correct an event by appending a superseding row (original is kept for the audit trail). */
export function correctEvent(originalId: string, patch: Partial<Omit<TimelineEvent, "id" | "petId">>): string {
  const cur = getEvent(originalId);
  if (!cur) return originalId;
  return insertEvent({ ...cur, ...patch }, originalId);
}

/** Soft-delete = append a tombstone that supersedes the event AND is itself hidden (deleted=1). */
export function deleteEvent(id: string): void {
  const cur = getEvent(id);
  if (!cur) return;
  insertEvent({ ...cur, summary: "(deleted)", confirmed: false }, id, true);
}

// ---- reminders ----
export const listReminders = (petId: string): Reminder[] =>
  db().getAllSync(`SELECT * FROM reminders WHERE pet_id = ? ORDER BY created_at`, [petId]).map(toReminder);
export const nextReminder = (petId: string): Reminder | undefined => listReminders(petId)[0];

export function insertReminder(r: Omit<Reminder, "id">): string {
  const id = genId("r");
  db().runSync(
    `INSERT INTO reminders (id,pet_id,title,schedule,next_label,remaining_label,created_at)
     VALUES (?,?,?,?,?,?,?)`,
    [id, r.petId, r.title, r.schedule, r.nextLabel, r.remainingLabel ?? null, now()]
  );
  return id;
}
export function setReminderDone(id: string, done: boolean): void {
  db().runSync(`UPDATE reminders SET done = ? WHERE id = ?`, [done ? 1 : 0, id]);
}
export function snoozeReminder(id: string, nextLabel: string): void {
  db().runSync(`UPDATE reminders SET next_label = ? WHERE id = ?`, [nextLabel, id]);
}

// ---- calendar ----
export const listCalendar = (petId?: string): CalendarItem[] =>
  (petId
    ? db().getAllSync(`SELECT * FROM calendar_items WHERE pet_id = ? ORDER BY date`, [petId])
    : db().getAllSync(`SELECT * FROM calendar_items ORDER BY date`)
  ).map(toCalendarItem);

export function insertCalendarItem(c: Omit<CalendarItem, "id">): string {
  const id = genId("c");
  db().runSync(
    `INSERT INTO calendar_items (id,pet_id,date,kind,title,time_label,done,created_at)
     VALUES (?,?,?,?,?,?,?,?)`,
    [id, c.petId, c.date, c.kind, c.title, c.timeLabel ?? null, c.done ? 1 : 0, now()]
  );
  return id;
}
