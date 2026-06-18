// Safety-floor regression tests for the fixes from the binding review.
import { redactDoses, hasDose, preScan, guardianReview, rulesMinBand } from "./guardian";
import { Pet } from "@/data/types";

const dog: Pet = { id: "p1", name: "Toby", species: "dog", riskFlags: ["deep-chested"], color: "#000" };
const cat: Pet = { id: "p2", name: "Luna", species: "cat", riskFlags: [], color: "#000" };
const rabbit: Pet = { id: "p3", name: "Pip", species: "other", riskFlags: [], color: "#000" };

describe("dose redaction (global)", () => {
  test("redacts EVERY dose, not just the first", () => {
    const out = redactDoses("Give 5mg in the morning and 10mg at night");
    expect(out).not.toMatch(/\d+\s?mg/);
    expect(out.match(/redacted/g)?.length).toBe(2);
  });
  test("hasDose detects mg/ml/tablet", () => {
    expect(hasDose("2 tablets")).toBe(true);
    expect(hasDose("no numbers here")).toBe(false);
  });
});

describe("uncertainty rounds UP (I5)", () => {
  test("missing/invalid band floors to at least vet_soon", () => {
    const g = guardianReview({ band: undefined, confidence: undefined }, dog, { trip: false, tripwires: [] });
    expect(g.band).toBe("vet_soon");
  });
  test("low confidence floors up", () => {
    expect(rulesMinBand({ band: "home_monitor", confidence: 0.2 }, { trip: false, tripwires: [] })).toBe("vet_soon");
  });
});

describe("dose stripped from ask_your_vet too", () => {
  test("ask_your_vet doses are redacted", () => {
    const g = guardianReview({ band: "vet_soon", askYourVet: ["Confirm the 250mg dose"] }, dog, { trip: false, tripwires: [] });
    expect(g.askYourVet[0]).not.toMatch(/250\s?mg/);
  });
});

describe("toxin species coverage", () => {
  test("chocolate trips URGENT for dog", () => {
    expect(preScan("he ate chocolate", dog)).toMatchObject({ trip: true, band: "vet_urgent" });
  });
  test("lily trips URGENT for cat", () => {
    expect(preScan("chewed a lily", cat)).toMatchObject({ trip: true, band: "vet_urgent" });
  });
  test("any toxin trips for 'other' species (unknown metabolism rounds up)", () => {
    expect(preScan("ate chocolate", rabbit)).toMatchObject({ trip: true, band: "vet_urgent" });
  });
});

describe("monotonic band (I8)", () => {
  test("guardian never downgrades", () => {
    const g = guardianReview({ band: "vet_urgent", confidence: 0.9 }, cat, { trip: false, tripwires: [] });
    expect(g.band).toBe("vet_urgent");
  });
});
