"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Shell } from "@/components/Shell";
import { LedgerList } from "@/components/LedgerList";
import { IconPlus } from "@/components/Icons";
import { inr } from "@/lib/api";
import { listDevices, subscribeSheets } from "@/lib/sheet-db";
import type { DeviceRecord } from "@/lib/types";

export function LedgerHome() {
  const [devices, setDevices] = useState<DeviceRecord[] | null>(null);

  useEffect(() => {
    const sync = () => setDevices(listDevices());
    sync();
    return subscribeSheets(sync);
  }, []);

  const rows = devices || [];
  const onShelf = rows.filter((d) => d.decision === "buy" && !d.soldAt);
  const capital = onShelf.reduce((s, d) => s + (d.offerPrice || 0), 0);

  return (
    <Shell>
      <div className="title-block">
        <p className="form-no">BS LEDGER TODAY</p>
        <h1>
          Shop
          <br />
          ledger
        </h1>
        <p className="lede">
          Same model can cost different money. Open a row. The sheet shows what failed and why the
          buy ceiling landed where it did.
        </p>
      </div>

      <div className="ticker" aria-label="Shop totals">
        <div>
          <span>Sheets</span>
          <b>{devices ? devices.length : "—"}</b>
        </div>
        <div>
          <span>On shelf</span>
          <b>{devices ? onShelf.length : "—"}</b>
        </div>
        <div>
          <span>Capital on shelf</span>
          <b>{devices ? inr(capital) : "—"}</b>
        </div>
      </div>

      {!devices ? (
        <p className="empty-line">Opening ledger…</p>
      ) : devices.length === 0 ? (
        <div className="empty-line">
          No sheets yet.{" "}
          <Link href="/intake" className="stamp-btn">
            <IconPlus size={15} /> Cut first sheet
          </Link>
        </div>
      ) : (
        <LedgerList devices={devices} />
      )}

      <p className="carbon-note">
        Flow: intake, checklist, grade stamp, max buy, buy or pass, list, sell, this ledger
      </p>
    </Shell>
  );
}
