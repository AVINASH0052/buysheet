"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api, inr, maskId } from "@/lib/api";
import type { DeviceRecord } from "@/lib/types";
import { gradeClass } from "./DeviceRow";
import { IconBattery, IconCheck, IconRupee, IconWarn, IconX } from "./Icons";

export function DeviceDetail({ initial }: { initial: DeviceRecord }) {
  const router = useRouter();
  const [device, setDevice] = useState(initial);
  const [offer, setOffer] = useState(String(initial.suggestedMaxBuy || ""));
  const [listPrice, setListPrice] = useState(String(initial.listPrice || ""));
  const [warranty, setWarranty] = useState(String(initial.warrantyDays ?? ""));
  const [soldPrice, setSoldPrice] = useState(String(initial.listPrice || initial.offerPrice || ""));
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [aiBusy, setAiBusy] = useState<"pitch" | "brief" | null>(null);
  const [aiSource, setAiSource] = useState<"nvidia" | "local" | null>(null);

  async function decide(decision: "buy" | "pass") {
    setBusy(true);
    setError("");
    try {
      const next = await api.decide(
        device.id,
        decision,
        decision === "buy" ? Number(offer) : undefined
      );
      setDevice(next);
      if (next.listPrice != null) {
        setListPrice(String(next.listPrice));
        setSoldPrice(String(next.listPrice));
      }
      if (next.warrantyDays != null) setWarranty(String(next.warrantyDays));
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function saveListing() {
    setBusy(true);
    setError("");
    try {
      const next = await api.listing(
        device.id,
        listPrice ? Number(listPrice) : undefined,
        warranty ? Number(warranty) : undefined
      );
      setDevice(next);
      if (next.listPrice != null) setSoldPrice(String(next.listPrice));
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function markSold() {
    setBusy(true);
    setError("");
    try {
      const next = await api.sell(device.id, Number(soldPrice));
      setDevice(next);
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function runAi(kind: "pitch" | "brief") {
    setAiBusy(kind);
    setError("");
    try {
      const { device: next, source } = await api.ai(device.id, kind);
      setDevice(next);
      setAiSource(source);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setAiBusy(null);
    }
  }

  const twins = device.twins || [];

  return (
    <div className="detail">
      <section className="detail-hero">
        <div>
          <p className="eyebrow">Condition card keep with device</p>
          <h1>
            {device.brand}
            <br />
            {device.model}
          </h1>
          <p className="device-sub">
            {device.storage}
            {device.color ? ` / ${device.color}` : ""}, {maskId(device.identifier)},{" "}
            {device.staffName}
            {device.soldAt ? ", SOLD" : ""}
          </p>
        </div>
        <div className={gradeClass(device.grade)} style={{ width: 72, height: 72, fontSize: "1.5rem" }}>
          {device.grade === "reject" ? "NO" : device.grade}
        </div>
      </section>

      <div className="detail-grid">
        <section className="panel">
          <h2>Why this price</h2>
          <div className="price-stack">
            <div>
              <span className="muted">Street ask (clean)</span>
              <strong>{inr(device.streetAsk)}</strong>
            </div>
            <div>
              <span className="muted">Max buy</span>
              <strong>{inr(device.suggestedMaxBuy)}</strong>
            </div>
            {device.offerPrice != null ? (
              <div>
                <span className="muted">Paid</span>
                <strong>{inr(device.offerPrice)}</strong>
              </div>
            ) : null}
            {device.listPrice != null ? (
              <div>
                <span className="muted">List ask</span>
                <strong>{inr(device.listPrice)}</strong>
              </div>
            ) : null}
            {device.soldPrice != null ? (
              <div>
                <span className="muted">Sold for</span>
                <strong>{inr(device.soldPrice)}</strong>
              </div>
            ) : null}
            {device.warrantyDays != null ? (
              <div>
                <span className="muted">Warranty</span>
                <strong>{device.warrantyDays} days</strong>
              </div>
            ) : null}
          </div>
          {device.rejectReason ? <p className="reject-reason">{device.rejectReason}</p> : null}
          <ul className="deductions">
            {device.deductions.map((d) => (
              <li key={d.label}>
                <span>{d.label}</span>
                <em>{d.impact}</em>
              </li>
            ))}
          </ul>
          {typeof device.batteryHealthPct === "number" ? (
            <p className="hint">
              <IconBattery size={14} /> Battery health recorded at {device.batteryHealthPct}%
            </p>
          ) : null}
          {device.notes ? <p className="notes-block">{device.notes}</p> : null}
          {twins.length > 0 ? (
            <div className="twins">
              <p className="eyebrow">Same model on shelf</p>
              <ul className="deductions">
                {twins.map((t) => (
                  <li key={t.id}>
                    <Link href={`/devices/${t.id}`}>
                      Grade {t.grade}
                      {t.color ? ` ${t.color}` : ""}
                    </Link>
                    <em>{t.listPrice != null ? inr(t.listPrice) : inr(t.offerPrice || 0)}</em>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>

        <section className="panel">
          <h2>Decision</h2>
          {device.decision === "pending" && device.grade !== "reject" ? (
            <>
              <label>
                Offer to seller (₹)
                <input
                  type="number"
                  value={offer}
                  min={1}
                  max={device.suggestedMaxBuy}
                  onChange={(e) => setOffer(e.target.value)}
                />
              </label>
              <p className="hint">
                Ceiling is {inr(device.suggestedMaxBuy)}. Buys above it are blocked.
              </p>
              {error ? <p className="error">{error}</p> : null}
              <div className="decision-row">
                <button
                  type="button"
                  className="primary-btn"
                  disabled={busy}
                  onClick={() => decide("buy")}
                >
                  <IconRupee size={16} /> Buy at offer
                </button>
                <button
                  type="button"
                  className="ghost-btn"
                  disabled={busy}
                  onClick={() => decide("pass")}
                >
                  <IconX size={16} /> Pass
                </button>
              </div>
            </>
          ) : (
            <div className="decision-done">
              {device.decision === "buy" ? (
                <p>
                  <IconCheck size={18} /> Bought for <strong>{inr(device.offerPrice || 0)}</strong>
                </p>
              ) : (
                <p>
                  <IconWarn size={18} /> Passed. Not added to sellable stock.
                </p>
              )}
            </div>
          )}
        </section>
      </div>

      {device.decision === "buy" ? (
        <div className="detail-grid" style={{ marginTop: 12 }}>
          <section className="panel">
            <h2>Listing and sale</h2>
            {!device.soldAt ? (
              <>
                <div className="grid-2">
                  <label>
                    List ask (₹)
                    <input
                      type="number"
                      value={listPrice}
                      onChange={(e) => setListPrice(e.target.value)}
                    />
                  </label>
                  <label>
                    Warranty days
                    <input
                      type="number"
                      min={0}
                      max={365}
                      value={warranty}
                      onChange={(e) => setWarranty(e.target.value)}
                    />
                  </label>
                </div>
                {device.offerPrice != null && listPrice ? (
                  <p className="hint">
                    Paper margin {inr(Number(listPrice) - device.offerPrice)} before fees.
                  </p>
                ) : null}
                <div className="decision-row">
                  <button type="button" className="stamp-btn" disabled={busy} onClick={saveListing}>
                    Save listing
                  </button>
                  <Link href={`/devices/${device.id}/tag`} className="ghost-btn">
                    Shelf tag
                  </Link>
                </div>
                <label style={{ marginTop: 14 }}>
                  Sold price (₹)
                  <input
                    type="number"
                    value={soldPrice}
                    onChange={(e) => setSoldPrice(e.target.value)}
                  />
                </label>
                {error ? <p className="error">{error}</p> : null}
                <div className="decision-row">
                  <button type="button" className="primary-btn" disabled={busy} onClick={markSold}>
                    Mark sold
                  </button>
                </div>
              </>
            ) : (
              <div className="decision-done">
                <p>
                  <IconCheck size={18} /> Sold for <strong>{inr(device.soldPrice || 0)}</strong>
                  {device.offerPrice != null ? (
                    <>
                      {" "}
                      (realized {inr((device.soldPrice || 0) - device.offerPrice)})
                    </>
                  ) : null}
                </p>
                <Link href={`/devices/${device.id}/tag`} className="ghost-btn" style={{ marginTop: 10 }}>
                  View tag
                </Link>
              </div>
            )}
          </section>

          <section className="panel">
            <h2>NVIDIA copy desk</h2>
            <p className="hint">
              Tries NVIDIA NIM (GLM 5.2). Falls back to a local sheet pitch if chat times out.
            </p>
            <div className="decision-row">
              <button
                type="button"
                className="ghost-btn"
                disabled={aiBusy !== null}
                onClick={() => runAi("pitch")}
              >
                {aiBusy === "pitch" ? "Writing..." : "Customer pitch"}
              </button>
              <button
                type="button"
                className="ghost-btn"
                disabled={aiBusy !== null}
                onClick={() => runAi("brief")}
              >
                {aiBusy === "brief" ? "Writing..." : "Owner brief"}
              </button>
            </div>
            {aiSource ? (
              <p className="hint">
                Source: {aiSource === "nvidia" ? "NVIDIA NIM" : "local fallback"}
              </p>
            ) : null}
            {device.customerPitch ? (
              <div className="ai-block">
                <span className="eyebrow">For the customer</span>
                <p>{device.customerPitch}</p>
              </div>
            ) : null}
            {device.ownerBrief ? (
              <div className="ai-block">
                <span className="eyebrow">For the owner</span>
                <p>{device.ownerBrief}</p>
              </div>
            ) : null}
          </section>
        </div>
      ) : null}
    </div>
  );
}
