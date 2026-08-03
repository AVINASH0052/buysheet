import { NextResponse } from "next/server";
import { CATALOG, CHECK_LABELS, CHECK_ORDER, FLAG_LABELS } from "@/server/catalog";
import { nvidiaConfigured } from "@/server/nvidia";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    catalog: CATALOG,
    checkLabels: CHECK_LABELS,
    checkOrder: CHECK_ORDER,
    flagLabels: FLAG_LABELS,
    nvidia: nvidiaConfigured(),
  });
}
