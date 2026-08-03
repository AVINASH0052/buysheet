"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { gradeClass } from "@/components/DeviceRow";
import { PrintButton } from "@/components/PrintButton";
import { inr, maskId } from "@/lib/api";
import { getDevice, subscribeSheets } from "@/lib/sheet-db";
import type { DeviceRecord } from "@/lib/types";

export function ShelfTag({ id }: { id: string }) {
  const [device, setDevice] = useState<DeviceRecord | null | undefined>(undefined);

  useEffect(() => {
    const sync = () => setDevice(getDevice(id) ?? null);
    sync();
    return subscribeSheets(sync);
  }, [id]);

  if (device === undefined) {
    return <p className="empty-line">Opening tag…</p>;
  }

  if (device === null) {
    return (
      <div className="tag-page">
        <p className="empty-line">
          Tag not found. <Link href="/">Back to ledger</Link>
        </p>
      </div>
    );
  }

  return (
    <div className="tag-page">
      <div className="tag-actions no-print">
        <Link href={`/devices/${device.id}`} className="nav-link">
          Back
        </Link>
        <PrintButton />
      </div>
      <article className="shelf-tag">
        <header>
          <span className="tag-brand">BUYSHEET</span>
          <span className={gradeClass(device.grade)}>
            {device.grade === "reject" ? "NO" : device.grade}
          </span>
        </header>
        <h1>
          {device.brand} {device.model}
        </h1>
        <p className="tag-meta">
          {device.storage}
          {device.color ? ` / ${device.color}` : ""}
          <br />
          {maskId(device.identifier)}
        </p>
        <p className="tag-price">
          {device.listPrice != null ? inr(device.listPrice) : inr(device.suggestedMaxBuy)}
        </p>
        {device.warrantyDays != null ? (
          <p className="tag-war">{device.warrantyDays} day shop warranty</p>
        ) : null}
        <ul className="tag-points">
          {device.deductions.slice(0, 4).map((d) => (
            <li key={d.label}>{d.label}</li>
          ))}
        </ul>
        {device.customerPitch ? <p className="tag-pitch">{device.customerPitch}</p> : null}
        <footer>Ask staff to open the full sheet for battery and flags.</footer>
      </article>
    </div>
  );
}
