import OpenAI from "openai";
import type { DeviceRecord } from "./types";

const MODEL = process.env.NVIDIA_MODEL || "z-ai/glm-5.2";
const TIMEOUT_MS = Number(process.env.NVIDIA_TIMEOUT_MS || 25000);

export function nvidiaConfigured() {
  return Boolean(process.env.NVIDIA_API_KEY?.trim());
}

function client() {
  const key = process.env.NVIDIA_API_KEY?.trim();
  if (!key) throw new Error("NVIDIA_API_KEY missing. Add it in Vercel env vars.");
  return new OpenAI({
    baseURL: "https://integrate.api.nvidia.com/v1",
    apiKey: key,
    timeout: TIMEOUT_MS,
    maxRetries: 0,
  });
}

/** Collect streamed GLM tokens (matches build.nvidia.com OpenAI snippet). */
async function chat(system: string, user: string): Promise<string> {
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), TIMEOUT_MS);

  try {
    const stream = await client().chat.completions.create(
      {
        model: MODEL,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        temperature: 1,
        top_p: 1,
        max_tokens: 512,
        seed: 42,
        stream: true,
        // NVIDIA GLM build snippet (Python extra_body)
        ...({
          chat_template_kwargs: { enable_thinking: false, clear_thinking: true },
        } as Record<string, unknown>),
      },
      { signal: ac.signal }
    );

    let text = "";
    for await (const chunk of stream) {
      const delta = chunk.choices?.[0]?.delta?.content;
      if (delta) text += delta;
    }
    text = text.trim();
    if (!text) throw new Error("Empty response from NVIDIA");
    return text;
  } finally {
    clearTimeout(timer);
  }
}

function deviceFacts(d: DeviceRecord) {
  return {
    model: `${d.brand} ${d.model} ${d.storage}`,
    grade: d.grade,
    streetAsk: d.streetAsk,
    maxBuy: d.suggestedMaxBuy,
    paid: d.offerPrice ?? null,
    listPrice: d.listPrice ?? null,
    warrantyDays: d.warrantyDays ?? null,
    battery: d.batteryHealthPct ?? null,
    deductions: d.deductions,
    notes: d.notes ?? null,
    flags: Object.entries(d.flags)
      .filter(([, v]) => v)
      .map(([k]) => k),
    fails: Object.entries(d.checks)
      .filter(([, v]) => v === "fail")
      .map(([k]) => k),
  };
}

function localPitch(d: DeviceRecord): string {
  const fails = Object.entries(d.checks)
    .filter(([, v]) => v === "fail")
    .map(([k]) => k);
  const ask = d.listPrice ?? d.streetAsk;
  const bat =
    typeof d.batteryHealthPct === "number"
      ? ` Battery health checked at ${d.batteryHealthPct}%.`
      : "";
  const issues =
    fails.length > 0
      ? ` Noted issues: ${fails.join(", ")}.`
      : " Checklist came back clean on the counter.";
  const war =
    d.warrantyDays != null && d.warrantyDays > 0
      ? ` Comes with ${d.warrantyDays} days shop warranty.`
      : "";
  return `This ${d.brand} ${d.model} (${d.storage}) is grade ${d.grade.toUpperCase()}. Ask is Rs ${ask}.${bat}${issues}${war} Price follows the sheet, not a guess.`;
}

function localBrief(d: DeviceRecord): string {
  const paid = d.offerPrice ?? 0;
  const list = d.listPrice ?? 0;
  const margin = list && paid ? list - paid : null;
  const line1 = `${d.brand} ${d.model}: grade ${d.grade}, paid Rs ${paid}${list ? `, list Rs ${list}` : ""}.`;
  const line2 =
    margin != null
      ? `Paper margin Rs ${margin} before marketplace fees.`
      : `Set a list price before it hits the shelf.`;
  const risks = [
    ...Object.entries(d.flags).filter(([, v]) => v).map(([k]) => k),
    ...Object.entries(d.checks).filter(([, v]) => v === "fail").map(([k]) => k),
  ];
  const line3 =
    risks.length > 0
      ? `Watch: ${risks.slice(0, 3).join(", ")}.`
      : `Watch: confirm IMEI story if the buyer pushes for a deeper discount.`;
  return `${line1}\n${line2}\n${line3}`;
}

async function withFallback(
  kind: "pitch" | "brief",
  d: DeviceRecord,
  remote: () => Promise<string>
): Promise<{ text: string; source: "nvidia" | "local" }> {
  if (!nvidiaConfigured()) {
    return { text: kind === "pitch" ? localPitch(d) : localBrief(d), source: "local" };
  }
  try {
    return { text: await remote(), source: "nvidia" };
  } catch {
    return { text: kind === "pitch" ? localPitch(d) : localBrief(d), source: "local" };
  }
}

export function customerPitch(d: DeviceRecord) {
  return withFallback("pitch", d, () =>
    chat(
      `You write short shelf talk for an Indian second-hand phone shop. Plain English, no jargon, no markdown, no emojis, no dashes. Max 70 words. Explain grade and price honestly so a customer trusts the ask.`,
      JSON.stringify(deviceFacts(d))
    )
  );
}

export function ownerBrief(d: DeviceRecord) {
  return withFallback("brief", d, () =>
    chat(
      `You advise the owner of a used electronics shop in India. 3 short lines only. No markdown, no bullet dashes, no emojis. Cover: buy quality, suggested list band if missing, and one risk to watch. Use rupees as Rs.`,
      JSON.stringify(deviceFacts(d))
    )
  );
}
