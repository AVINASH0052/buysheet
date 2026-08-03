"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Shell } from "@/components/Shell";
import { gradeClass } from "@/components/DeviceRow";
import { inr } from "@/lib/api";
import { ownerSummary, subscribeSheets } from "@/lib/sheet-db";
import type { OwnerSummary } from "@/lib/types";

export function OwnerDesk() {
  const [summary, setSummary] = useState<OwnerSummary | null>(null);

  useEffect(() => {
    const sync = () => setSummary(ownerSummary());
    sync();
    return subscribeSheets(sync);
  }, []);

  if (!summary) {
    return (
      <Shell masthead="OWNER">
        <p className="empty-line">Opening owner desk…</p>
      </Shell>
    );
  }

  return (
    <Shell masthead="OWNER">
      <div className="title-block">
        <p className="form-no">OWNER DESK</p>
        <h1>
          Money
          <br />
          on shelf
        </h1>
        <p className="lede">
          Capital stuck in stock, paper margin if everything sells at list, and cash you already
          locked in from sold units.
        </p>
      </div>

      <div className="ticker ticker-4">
        <div>
          <span>Capital in</span>
          <b>{inr(summary.capitalIn)}</b>
        </div>
        <div>
          <span>List value</span>
          <b>{inr(summary.listValue)}</b>
        </div>
        <div>
          <span>Paper margin</span>
          <b>{inr(summary.paperMargin)}</b>
        </div>
        <div>
          <span>Realized</span>
          <b>{inr(summary.realizedMargin)}</b>
        </div>
      </div>

      <div className="ticker" style={{ marginTop: 10 }}>
        <div>
          <span>On shelf</span>
          <b>{summary.onShelf}</b>
        </div>
        <div>
          <span>Sold</span>
          <b>{summary.sold}</b>
        </div>
        <div>
          <span>Waiting decision</span>
          <b>{summary.pending}</b>
        </div>
      </div>

      <div className="detail-grid">
        <section className="panel">
          <h2>Staff buys</h2>
          <ul className="deductions">
            {Object.entries(summary.byStaff).length === 0 ? (
              <li>
                <span>No buys yet</span>
                <em>n/a</em>
              </li>
            ) : (
              Object.entries(summary.byStaff).map(([name, n]) => (
                <li key={name}>
                  <span>{name}</span>
                  <em>{n} bought</em>
                </li>
              ))
            )}
          </ul>
          <p className="hint">
            Passed {summary.passed}, sheets {summary.sheets}
            {summary.needsListPrice ? `, ${summary.needsListPrice} still need list price` : ""}
          </p>
        </section>

        <section className="panel">
          <h2>On shelf now</h2>
          <ul className="owner-buys">
            {summary.recentBought.length === 0 ? (
              <li>
                <span className="muted">Shelf empty</span>
              </li>
            ) : (
              summary.recentBought.map((d) => (
                <li key={d.id}>
                  <Link href={`/devices/${d.id}`}>
                    <span className={gradeClass(d.grade)}>
                      {d.grade === "reject" ? "NO" : d.grade}
                    </span>
                    <span>
                      <strong>
                        {d.brand} {d.model}
                      </strong>
                      <em>
                        paid {inr(d.offerPrice || 0)}
                        {d.listPrice != null ? `, list ${inr(d.listPrice)}` : ""}
                      </em>
                    </span>
                  </Link>
                </li>
              ))
            )}
          </ul>
          {summary.recentSold?.length ? (
            <>
              <h2 style={{ marginTop: 16 }}>Recently sold</h2>
              <ul className="owner-buys">
                {summary.recentSold.map((d) => (
                  <li key={d.id}>
                    <Link href={`/devices/${d.id}`}>
                      <span className={gradeClass(d.grade)}>
                        {d.grade === "reject" ? "NO" : d.grade}
                      </span>
                      <span>
                        <strong>
                          {d.brand} {d.model}
                        </strong>
                        <em>
                          sold {inr(d.soldPrice || 0)}
                          {d.offerPrice != null
                            ? ` (margin ${inr((d.soldPrice || 0) - d.offerPrice)})`
                            : ""}
                        </em>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          ) : null}
        </section>
      </div>
    </Shell>
  );
}
