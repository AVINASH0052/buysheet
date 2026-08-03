"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { api, inr } from "@/lib/api";
import type {
 CheckKey,
 CheckResult,
 FlagKey,
 GradeBreakdown,
 IntakeInput,
 Meta,
} from "@/lib/types";
import { IconArrow, IconBattery, IconCheck, IconRupee, IconWarn, IconX } from "./Icons";
import { gradeClass } from "./DeviceRow";

const emptyChecks = (order: CheckKey[]): Record<CheckKey, CheckResult> =>
 Object.fromEntries(order.map((k) => [k, "pass"])) as Record<CheckKey, CheckResult>;

const emptyFlags = (keys: FlagKey[]): Record<FlagKey, boolean> =>
 Object.fromEntries(keys.map((k) => [k, false])) as Record<FlagKey, boolean>;

export function IntakeForm() {
 const router = useRouter();
 const [meta, setMeta] = useState<Meta | null>(null);
 const [error, setError] = useState("");
 const [busy, setBusy] = useState(false);
 const [preview, setPreview] = useState<GradeBreakdown | null>(null);

 const [staffName, setStaffName] = useState("Rafi");
 const [catalogId, setCatalogId] = useState("ip13-128");
 const [identifier, setIdentifier] = useState("");
 const [color, setColor] = useState("");
 const [sellerAsking, setSellerAsking] = useState<string>("");
 const [battery, setBattery] = useState<string>("85");
 const [notes, setNotes] = useState("");
 const [checks, setChecks] = useState<Record<CheckKey, CheckResult> | null>(null);
 const [flags, setFlags] = useState<Record<FlagKey, boolean> | null>(null);

 useEffect(() => {
 api.meta().then((m) => {
 setMeta(m);
 setChecks(emptyChecks(m.checkOrder));
 setFlags(emptyFlags(Object.keys(m.flagLabels) as FlagKey[]));
 }).catch((e) => setError(e.message));
 }, []);

 const body: IntakeInput | null = useMemo(() => {
 if (!checks || !flags) return null;
 return {
 staffName,
 catalogId,
 identifier,
 color: color || undefined,
 sellerAsking: sellerAsking ? Number(sellerAsking) : undefined,
 batteryHealthPct: battery ? Number(battery) : undefined,
 checks,
 flags,
 notes: notes || undefined,
 };
 }, [staffName, catalogId, identifier, color, sellerAsking, battery, checks, flags, notes]);

 useEffect(() => {
 if (!body || !body.catalogId) return;
 const t = setTimeout(() => {
 api.preview(body).then(setPreview).catch(() => setPreview(null));
 }, 200);
 return () => clearTimeout(t);
 }, [body]);

 async function submit(e: React.FormEvent) {
 e.preventDefault();
 if (!body) return;
 setBusy(true);
 setError("");
 try {
 const row = await api.create(body);
 router.push(`/devices/${row.id}`);
 } catch (err) {
 setError((err as Error).message);
 setBusy(false);
 }
 }

 if (!meta || !checks || !flags) {
 return <p className="muted">Loading checklist…</p>;
 }

 const selected = meta.catalog.find((c) => c.id === catalogId);

 return (
 <form className="intake" onSubmit={submit}>
 <section className="panel">
 <h2>Section A Device</h2>
 <div className="grid-2">
 <label>
 Staff at the counter
 <input value={staffName} onChange={(e) => setStaffName(e.target.value)} required />
 </label>
 <label>
 Model
 <select value={catalogId} onChange={(e) => setCatalogId(e.target.value)}>
 {meta.catalog.map((c) => (
 <option key={c.id} value={c.id}>
 {c.brand} {c.model} ({c.storage})
 </option>
 ))}
 </select>
 </label>
 <label>
 IMEI / serial
 <input
 value={identifier}
 onChange={(e) => setIdentifier(e.target.value)}
 placeholder="15-digit IMEI or serial"
 required
 autoComplete="off"
 />
 </label>
 <label>
 Colour
 <input value={color} onChange={(e) => setColor(e.target.value)} placeholder="optional" />
 </label>
 <label>
 Seller asking (₹)
 <input
 type="number"
 min={0}
 value={sellerAsking}
 onChange={(e) => setSellerAsking(e.target.value)}
 placeholder="what they want"
 />
 </label>
 <label>
 <span className="label-with-icon">
 <IconBattery size={14} /> Battery health %
 </span>
 <input
 type="number"
 min={0}
 max={100}
 value={battery}
 onChange={(e) => setBattery(e.target.value)}
 placeholder="phones / laptops"
 />
 </label>
 </div>
 {selected ? (
 <p className="hint">
 Street ask for a clean unit: <strong>{inr(selected.streetAsk)}</strong>
 <span className="muted"> (mocked comps, expandable later)</span>
 </p>
 ) : null}
 </section>

 <section className="panel">
 <h2>Section B Checklist</h2>
 <p className="hint">Tap fail only when you saw the fault. Skip if the test does not apply.</p>
 <ul className="check-list">
 {meta.checkOrder.map((key) => (
 <li key={key}>
 <span>{meta.checkLabels[key]}</span>
 <div className="seg" role="group" aria-label={meta.checkLabels[key]}>
 {(["pass", "fail", "skip"] as CheckResult[]).map((v) => (
 <button
 key={v}
 type="button"
 className={`seg-btn ${checks[key] === v ? `on on-${v}` : ""}`}
 onClick={() => setChecks({ ...checks, [key]: v })}
 >
 {v === "pass" ? <IconCheck size={14} /> : v === "fail" ? <IconX size={14} /> : null}
 {v}
 </button>
 ))}
 </div>
 </li>
 ))}
 </ul>
 </section>

 <section className="panel">
 <h2>Section C Risk flags</h2>
 <div className="flags">
 {(Object.keys(meta.flagLabels) as FlagKey[]).map((key) => (
 <label key={key} className={`flag ${flags[key] ? "flag-on" : ""}`}>
 <input
 type="checkbox"
 checked={flags[key]}
 onChange={(e) => setFlags({ ...flags, [key]: e.target.checked })}
 />
 <IconWarn size={16} />
 {meta.flagLabels[key]}
 </label>
 ))}
 </div>
 <label className="notes">
 Notes for the shelf tag
 <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
 </label>
 </section>

 <aside className="grade-dock">
 <div className="grade-dock-inner">
 <h2>Stamp preview</h2>
 {preview ? (
 <>
 <div className={gradeClass(preview.grade)} key={preview.grade}>
 {preview.grade === "reject" ? "NO" : preview.grade}
 </div>
 <div className="max-buy">
 <IconRupee size={18} />
 <div>
 <span className="muted">CEILING</span>
 <strong>{inr(preview.suggestedMaxBuy)}</strong>
 </div>
 </div>
 {preview.rejectReason ? (
 <p className="reject-reason">{preview.rejectReason}</p>
 ) : null}
 <ul className="deductions">
 {preview.deductions.map((d) => (
 <li key={d.label}>
 <span>{d.label}</span>
 <em>{d.impact}</em>
 </li>
 ))}
 </ul>
 </>
 ) : (
 <p className="muted">Fill the sheet to see a ceiling.</p>
 )}
 {error ? <p className="error">{error}</p> : null}
 <button className="primary-btn" type="submit" disabled={busy || !identifier.trim()}>
 Save sheet
 <IconArrow size={16} />
 </button>
 </div>
 </aside>
 </form>
 );
}
