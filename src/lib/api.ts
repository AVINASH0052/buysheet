"use client";

import { CATALOG, CHECK_LABELS, CHECK_ORDER, FLAG_LABELS } from "@/server/catalog";
import { gradeIntake } from "@/server/grade";
import type {
  Decision,
  DeviceRecord,
  GradeBreakdown,
  IntakeInput,
  Meta,
  OwnerSummary,
} from "./types";
import {
  createDevice,
  decideDevice,
  getDevice,
  listDevices,
  ownerSummary,
  saveAiText,
  sellDevice,
  updateListing,
  withTwins,
} from "./sheet-db";

/** Stateless API helpers (meta / preview / AI). Mutations use browser sheet-db. */
async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    cache: "no-store",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || res.statusText);
  return data as T;
}

export const api = {
  meta: async (): Promise<Meta> => {
    try {
      return await req<Meta>("/meta");
    } catch {
      return {
        catalog: CATALOG,
        checkLabels: CHECK_LABELS,
        checkOrder: CHECK_ORDER,
        flagLabels: FLAG_LABELS,
        nvidia: false,
      };
    }
  },
  devices: async () => listDevices(),
  device: async (id: string) => {
    const row = getDevice(id);
    if (!row) throw new Error("Device not found");
    return withTwins(row);
  },
  owner: async () => ownerSummary(),
  preview: async (body: IntakeInput): Promise<GradeBreakdown> => {
    const catalog = CATALOG.find((c) => c.id === body.catalogId);
    if (!catalog) throw new Error("Unknown catalog model");
    return gradeIntake(body, catalog);
  },
  create: async (body: IntakeInput) => createDevice(body),
  decide: async (id: string, decision: Decision, offerPrice?: number) =>
    decideDevice(id, decision, offerPrice),
  listing: async (id: string, listPrice?: number, warrantyDays?: number) =>
    updateListing(id, { listPrice, warrantyDays }),
  sell: async (id: string, soldPrice: number) => sellDevice(id, soldPrice),
  ai: async (id: string, kind: "pitch" | "brief") => {
    const row = getDevice(id);
    if (!row) throw new Error("Device not found");
    const result = await req<{ text: string; source: "nvidia" | "local"; device?: DeviceRecord }>(
      `/devices/${id}/ai/${kind}`,
      { method: "POST", body: JSON.stringify({ device: row }) }
    );
    const field = kind === "pitch" ? "customerPitch" : "ownerBrief";
    const saved = saveAiText(id, field, result.text);
    return { text: result.text, source: result.source, device: saved };
  },
};

export function inr(n: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

export function maskId(id: string) {
  const t = id.trim();
  if (t.length <= 4) return t;
  return `${"•".repeat(Math.min(8, t.length - 4))}${t.slice(-4)}`;
}

export type { OwnerSummary };
