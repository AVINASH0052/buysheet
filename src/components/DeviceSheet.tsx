"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Shell } from "@/components/Shell";
import { DeviceDetail } from "@/components/DeviceDetail";
import { IconBack } from "@/components/Icons";
import { getDevice, subscribeSheets, withTwins } from "@/lib/sheet-db";
import type { DeviceRecord } from "@/lib/types";

export function DeviceSheet({ id }: { id: string }) {
  const [device, setDevice] = useState<DeviceRecord | null | undefined>(undefined);

  useEffect(() => {
    const sync = () => {
      const row = getDevice(id);
      setDevice(row ? withTwins(row) : null);
    };
    sync();
    return subscribeSheets(sync);
  }, [id]);

  if (device === undefined) {
    return (
      <Shell masthead="SHEET">
        <p className="empty-line">Opening sheet…</p>
      </Shell>
    );
  }

  if (device === null) {
    return (
      <Shell masthead="SHEET">
        <p style={{ marginBottom: 14 }}>
          <Link href="/" className="nav-link">
            <IconBack size={16} /> Ledger
          </Link>
        </p>
        <p className="empty-line">
          Sheet not found in this browser. Cut a new sheet or open one from the ledger.
        </p>
      </Shell>
    );
  }

  return (
    <Shell masthead="SHEET">
      <p style={{ marginBottom: 14 }}>
        <Link href="/" className="nav-link">
          <IconBack size={16} /> Ledger
        </Link>
      </p>
      <DeviceDetail
        key={`${device.id}-${device.decision}-${device.soldAt || ""}-${device.listPrice || ""}-${device.customerPitch || ""}`}
        initial={device}
      />
    </Shell>
  );
}
