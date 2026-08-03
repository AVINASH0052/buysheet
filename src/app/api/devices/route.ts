import { NextResponse } from "next/server";
import { listDevices } from "@/server/store";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(listDevices());
}

export async function POST(req: Request) {
  try {
    const { createDevice } = await import("@/server/store");
    const row = createDevice(await req.json());
    return NextResponse.json(row, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
