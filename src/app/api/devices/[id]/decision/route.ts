import { NextResponse } from "next/server";
import { decideDevice } from "@/server/store";
import type { Decision } from "@/server/types";

export const dynamic = "force-dynamic";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { decision, offerPrice } = (await req.json()) as {
      decision: Decision;
      offerPrice?: number;
    };
    if (decision !== "buy" && decision !== "pass") {
      return NextResponse.json({ error: "decision must be buy or pass" }, { status: 400 });
    }
    return NextResponse.json(decideDevice(id, decision, offerPrice));
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
