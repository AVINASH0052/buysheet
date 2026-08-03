import { NextResponse } from "next/server";
import { nvidiaConfigured } from "@/server/nvidia";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ ok: true, nvidia: nvidiaConfigured() });
}
