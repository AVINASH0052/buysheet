import { randomUUID } from "crypto";
import { CATALOG } from "./catalog";
import { defaultChecks, defaultFlags, gradeIntake } from "./grade";
import type { Decision, DeviceRecord, IntakeInput } from "./types";

type Bag = { devices: DeviceRecord[]; seeded: boolean };

function bag(): Bag {
  const g = globalThis as typeof globalThis & { __buysheet?: Bag };
  if (!g.__buysheet) g.__buysheet = { devices: [], seeded: false };
  return g.__buysheet;
}

function persist(rows: DeviceRecord[]) {
  bag().devices = rows;
}

export function listDevices(): DeviceRecord[] {
  ensureSeed();
  return [...bag().devices].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getDevice(id: string): DeviceRecord | undefined {
  ensureSeed();
  return bag().devices.find((d) => d.id === id);
}

export function createDevice(input: IntakeInput): DeviceRecord {
  ensureSeed();
  const devices = bag().devices;
  const catalog = CATALOG.find((c) => c.id === input.catalogId);
  if (!catalog) throw new Error("Unknown catalog model");
  if (!input.identifier?.trim()) throw new Error("IMEI / serial required");
  if (!input.staffName?.trim()) throw new Error("Staff name required");

  const idKey = input.identifier.trim().toLowerCase();
  const dup = devices.find(
    (d) =>
      d.identifier.trim().toLowerCase() === idKey &&
      !d.soldAt &&
      d.decision !== "pass"
  );
  if (dup) {
    throw new Error(
      `IMEI/serial already on a live sheet (${dup.brand} ${dup.model}, grade ${dup.grade}). Check for a repeat intake.`
    );
  }

  const g = gradeIntake(input, catalog);
  const row: DeviceRecord = {
    ...input,
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    brand: catalog.brand,
    model: catalog.model,
    storage: catalog.storage,
    category: catalog.category,
    grade: g.grade,
    suggestedMaxBuy: g.suggestedMaxBuy,
    streetAsk: g.streetAsk,
    deductions: g.deductions,
    rejectReason: g.rejectReason,
    decision: g.grade === "reject" ? "pass" : "pending",
  };
  persist([row, ...devices]);
  return row;
}

export function decideDevice(
  id: string,
  decision: Decision,
  offerPrice?: number
): DeviceRecord {
  ensureSeed();
  const devices = bag().devices;
  const i = devices.findIndex((d) => d.id === id);
  if (i < 0) throw new Error("Device not found");
  const row = devices[i];
  if (decision === "buy") {
    if (row.grade === "reject") throw new Error("Rejected devices cannot be bought");
    if (typeof offerPrice !== "number" || offerPrice <= 0) {
      throw new Error("Offer price required to buy");
    }
    if (offerPrice > row.suggestedMaxBuy) {
      throw new Error(`Offer ₹${offerPrice} is above max buy ₹${row.suggestedMaxBuy}`);
    }
  }
  const next: DeviceRecord = {
    ...row,
    decision,
    offerPrice: decision === "buy" ? offerPrice : undefined,
  };
  if (decision === "buy" && offerPrice != null) {
    const mult = { A: 1, B: 0.92, C: 0.8, D: 0.65, reject: 0 }[row.grade];
    const warranty = { A: 90, B: 60, C: 30, D: 15, reject: 0 }[row.grade];
    next.listPrice = Math.round((row.streetAsk * mult) / 100) * 100;
    next.warrantyDays = warranty;
  }
  const copy = [...devices];
  copy[i] = next;
  persist(copy);
  return next;
}

export function updateListing(
  id: string,
  patch: { listPrice?: number; warrantyDays?: number }
): DeviceRecord {
  ensureSeed();
  const devices = bag().devices;
  const i = devices.findIndex((d) => d.id === id);
  if (i < 0) throw new Error("Device not found");
  const row = devices[i];
  if (row.decision !== "buy") throw new Error("Only bought devices can be listed");
  if (row.soldAt) throw new Error("Already sold");
  if (patch.listPrice != null) {
    if (patch.listPrice <= 0) throw new Error("List price must be positive");
    if (row.offerPrice != null && patch.listPrice < row.offerPrice) {
      throw new Error("List price below what you paid");
    }
  }
  if (patch.warrantyDays != null && (patch.warrantyDays < 0 || patch.warrantyDays > 365)) {
    throw new Error("Warranty days must be 0 to 365");
  }
  const next = { ...row, ...patch };
  const copy = [...devices];
  copy[i] = next;
  persist(copy);
  return next;
}

export function sellDevice(id: string, soldPrice: number): DeviceRecord {
  ensureSeed();
  const devices = bag().devices;
  const i = devices.findIndex((d) => d.id === id);
  if (i < 0) throw new Error("Device not found");
  const row = devices[i];
  if (row.decision !== "buy") throw new Error("Only bought devices can be sold");
  if (row.soldAt) throw new Error("Already sold");
  if (typeof soldPrice !== "number" || soldPrice <= 0) throw new Error("Sold price required");
  const next: DeviceRecord = {
    ...row,
    soldPrice,
    soldAt: new Date().toISOString(),
  };
  const copy = [...devices];
  copy[i] = next;
  persist(copy);
  return next;
}

export function twinsOnShelf(catalogId: string, exceptId?: string): DeviceRecord[] {
  return listDevices().filter(
    (d) =>
      d.catalogId === catalogId &&
      d.id !== exceptId &&
      d.decision === "buy" &&
      !d.soldAt
  );
}

export function saveAiText(
  id: string,
  field: "customerPitch" | "ownerBrief",
  text: string
): DeviceRecord {
  ensureSeed();
  const devices = bag().devices;
  const i = devices.findIndex((d) => d.id === id);
  if (i < 0) throw new Error("Device not found");
  const next = { ...devices[i], [field]: text };
  const copy = [...devices];
  copy[i] = next;
  persist(copy);
  return next;
}

export function ownerSummary() {
  const all = listDevices();
  const bought = all.filter((d) => d.decision === "buy");
  const onShelf = bought.filter((d) => !d.soldAt);
  const sold = bought.filter((d) => d.soldAt);
  const pending = all.filter((d) => d.decision === "pending");
  const passed = all.filter((d) => d.decision === "pass");
  const capital = onShelf.reduce((s, d) => s + (d.offerPrice || 0), 0);
  const listValue = onShelf.reduce((s, d) => s + (d.listPrice || 0), 0);
  const realized = sold.reduce(
    (s, d) => s + ((d.soldPrice || 0) - (d.offerPrice || 0)),
    0
  );
  const byStaff: Record<string, number> = {};
  for (const d of bought) byStaff[d.staffName] = (byStaff[d.staffName] || 0) + 1;
  return {
    sheets: all.length,
    bought: bought.length,
    onShelf: onShelf.length,
    sold: sold.length,
    pending: pending.length,
    passed: passed.length,
    capitalIn: capital,
    listValue,
    paperMargin: listValue - capital,
    realizedMargin: realized,
    byStaff,
    needsListPrice: onShelf.filter((d) => !d.listPrice).length,
    recentBought: onShelf.slice(0, 8),
    recentSold: sold.slice(0, 5),
  };
}

function ensureSeed() {
  const b = bag();
  if (b.seeded) return;
  b.seeded = true;
  if (b.devices.length > 0) return;

  const samples: IntakeInput[] = [
    {
      staffName: "Rafi",
      catalogId: "ip13-128",
      identifier: "356938035643809",
      color: "Midnight",
      sellerAsking: 28000,
      batteryHealthPct: 87,
      checks: defaultChecks(),
      flags: defaultFlags(),
      notes: "Seller had box, no bill.",
    },
    {
      staffName: "Meena",
      catalogId: "ip13-128",
      identifier: "356938035643810",
      color: "Blue",
      sellerAsking: 24000,
      batteryHealthPct: 74,
      checks: { ...defaultChecks(), bodyCondition: "fail", cameras: "fail" },
      flags: { ...defaultFlags(), replacedParts: true },
      notes: "Rear glass replaced. Front cam haze.",
    },
    {
      staffName: "Rafi",
      catalogId: "s23-256",
      identifier: "359827104455221",
      color: "Green",
      sellerAsking: 30000,
      batteryHealthPct: 91,
      checks: defaultChecks(),
      flags: defaultFlags(),
    },
    {
      staffName: "Meena",
      catalogId: "mba-m1-256",
      identifier: "C02XL0ABJGH5",
      sellerAsking: 48000,
      batteryHealthPct: 92,
      checks: { ...defaultChecks(), ports: "fail" },
      flags: defaultFlags(),
      notes: "USB-C port loose. Still usable with care.",
    },
  ];

  for (const s of samples) createDevice(s);
  const rows = listDevices();
  const clean13 = rows.find((r) => r.identifier.endsWith("809"));
  const s23 = rows.find((r) => r.model.includes("S23"));
  const damaged13 = rows.find((r) => r.identifier.endsWith("810"));
  if (clean13) decideDevice(clean13.id, "buy", clean13.suggestedMaxBuy);
  if (s23) decideDevice(s23.id, "buy", Math.min(s23.suggestedMaxBuy, 27000));
  if (damaged13) decideDevice(damaged13.id, "pass");
}
