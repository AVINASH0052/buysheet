import Link from "next/link";
import { inr, maskId } from "@/lib/api";
import type { Category, DeviceRecord, Grade } from "@/lib/types";
import { IconLaptop, IconPhone, IconTablet } from "./Icons";

function CatIcon({ category }: { category: Category }) {
  if (category === "laptop") return <IconLaptop size={16} />;
  if (category === "tablet") return <IconTablet size={16} />;
  return <IconPhone size={16} />;
}

export function gradeClass(g: Grade) {
  return `grade-stamp grade-${g}`;
}

export function DeviceRow({ device }: { device: DeviceRecord }) {
  const status = device.soldAt
    ? "SOLD"
    : device.decision === "buy"
      ? "FOR SALE"
      : device.decision === "pass"
        ? "PASSED"
        : "HOLD";

  const money = device.soldAt
    ? inr(device.soldPrice || 0)
    : device.decision === "buy" && device.listPrice != null
      ? inr(device.listPrice)
      : device.decision === "buy" && device.offerPrice != null
        ? inr(device.offerPrice)
        : device.decision === "pass"
          ? "n/a"
          : inr(device.suggestedMaxBuy);

  return (
    <Link href={`/devices/${device.id}`} className="ledger-row">
      <span className="ledger-cat" title={device.category}>
        <CatIcon category={device.category} />
      </span>
      <span className="ledger-name">
        <strong>
          {device.brand} {device.model}
        </strong>
        <em>
          {device.storage}
          {device.color ? ` / ${device.color}` : ""}, {maskId(device.identifier)}, {device.staffName}
        </em>
      </span>
      <span className={gradeClass(device.grade)} aria-label={`Grade ${device.grade}`}>
        {device.grade === "reject" ? "NO" : device.grade}
      </span>
      <span className={`ledger-money status-${device.soldAt ? "sold" : device.decision}`}>
        <strong>{money}</strong>
        <em>{status}</em>
      </span>
    </Link>
  );
}
