import { NextResponse } from "next/server";
import { customerPitch, ownerBrief } from "@/server/nvidia";
import type { DeviceRecord } from "@/server/types";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string; kind: string }> }
) {
  try {
    const { id, kind } = await params;
    if (kind !== "pitch" && kind !== "brief") {
      return NextResponse.json({ error: "kind must be pitch or brief" }, { status: 400 });
    }
    const body = (await req.json().catch(() => ({}))) as { device?: DeviceRecord };
    const row = body.device;
    if (!row || row.id !== id) {
      return NextResponse.json(
        { error: "Device payload required (browser sheet)." },
        { status: 400 }
      );
    }
    const result = kind === "pitch" ? await customerPitch(row) : await ownerBrief(row);
    const field = kind === "pitch" ? "customerPitch" : "ownerBrief";
    const saved = { ...row, [field]: result.text };
    return NextResponse.json({ text: result.text, source: result.source, device: saved });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 502 });
  }
}
