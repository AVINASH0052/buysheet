import { NextResponse } from "next/server";
import { ownerSummary } from "@/server/store";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(ownerSummary());
}
