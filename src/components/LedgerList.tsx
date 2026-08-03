"use client";

import { useMemo, useState } from "react";
import { DeviceRow } from "./DeviceRow";
import type { DeviceRecord } from "@/lib/types";

type Filter = "all" | "hold" | "sale" | "sold" | "passed";

export function LedgerList({ devices }: { devices: DeviceRecord[] }) {
  const [filter, setFilter] = useState<Filter>("all");

  const rows = useMemo(() => {
    return devices.filter((d) => {
      if (filter === "hold") return d.decision === "pending";
      if (filter === "sale") return d.decision === "buy" && !d.soldAt;
      if (filter === "sold") return Boolean(d.soldAt);
      if (filter === "passed") return d.decision === "pass";
      return true;
    });
  }, [devices, filter]);

  const counts = useMemo(
    () => ({
      all: devices.length,
      hold: devices.filter((d) => d.decision === "pending").length,
      sale: devices.filter((d) => d.decision === "buy" && !d.soldAt).length,
      sold: devices.filter((d) => d.soldAt).length,
      passed: devices.filter((d) => d.decision === "pass").length,
    }),
    [devices]
  );

  return (
    <>
      <div className="filter-row" role="tablist" aria-label="Ledger filter">
        {(
          [
            ["all", "All"],
            ["hold", "Hold"],
            ["sale", "For sale"],
            ["sold", "Sold"],
            ["passed", "Passed"],
          ] as [Filter, string][]
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={filter === key}
            className={`filter-btn ${filter === key ? "on" : ""}`}
            onClick={() => setFilter(key)}
          >
            {label} <b>{counts[key]}</b>
          </button>
        ))}
      </div>

      <div className="ledger-head" aria-hidden>
        <span>Type</span>
        <span>Device</span>
        <span>Grade</span>
        <span>Money</span>
      </div>

      {rows.length === 0 ? (
        <p className="empty-line">Nothing in this filter.</p>
      ) : (
        <div className="ledger">
          {rows.map((d, i) => (
            <div key={d.id} className="ledger-anim" style={{ animationDelay: `${i * 40}ms` }}>
              <DeviceRow device={d} />
            </div>
          ))}
        </div>
      )}
    </>
  );
}
