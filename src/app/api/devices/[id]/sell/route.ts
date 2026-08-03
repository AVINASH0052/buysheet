import { NextResponse } from "next/server";
import { sellDevice } from "@/server/store";

export const dynamic = "force-dynamic";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { soldPrice } = await req.json();
    if (typeof soldPrice !== "number") {
      return NextResponse.json({ error: "soldPrice required" }, { status: 400 });
    }
    return NextResponse.json(sellDevice(id, soldPrice));
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
