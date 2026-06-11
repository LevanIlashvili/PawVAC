// First-run seed: copy the mock fixtures into SQLite so the app opens with Toby/Luna/Pip.
// Runs once (guarded by isSeeded()). Preserves the original mock ids so the demo lines up.
import { db, isSeeded } from "./schema";
import { PETS, EVENTS, REMINDERS, CALENDAR } from "@/data/mock";

export function seedIfEmpty(): void {
  if (isSeeded()) return;
  const d = db();
  const t = d.getFirstSync<{ t: number }>(`SELECT strftime('%s','now') AS t`)?.t ?? 0;

  d.withTransactionSync(() => {
    PETS.forEach((p, i) => {
      d.runSync(
        `INSERT INTO pets (id,name,species,breed,sex,age_label,weight_kg,risk_flags,color,created_at)
         VALUES (?,?,?,?,?,?,?,?,?,?)`,
        [p.id, p.name, p.species, p.breed ?? null, p.sex ?? null, p.ageLabel ?? null,
         p.weightKg ?? null, JSON.stringify(p.riskFlags), p.color, t + i]
      );
    });
    EVENTS.forEach((e, i) => {
      d.runSync(
        `INSERT INTO events (id,pet_id,kind,summary,date_label,source,confirmed,supersedes,created_at)
         VALUES (?,?,?,?,?,?,?,NULL,?)`,
        [e.id, e.petId, e.kind, e.summary, e.dateLabel, e.source, e.confirmed ? 1 : 0, t - i]
      );
    });
    REMINDERS.forEach((r, i) => {
      d.runSync(
        `INSERT INTO reminders (id,pet_id,title,schedule,next_label,remaining_label,done,created_at)
         VALUES (?,?,?,?,?,?,0,?)`,
        [r.id, r.petId, r.title, r.schedule, r.nextLabel, r.remainingLabel ?? null, t + i]
      );
    });
    CALENDAR.forEach((c, i) => {
      d.runSync(
        `INSERT INTO calendar_items (id,pet_id,date,kind,title,time_label,done,created_at)
         VALUES (?,?,?,?,?,?,?,?)`,
        [c.id, c.petId, c.date, c.kind, c.title, c.timeLabel ?? null, c.done ? 1 : 0, t + i]
      );
    });
  });
}
