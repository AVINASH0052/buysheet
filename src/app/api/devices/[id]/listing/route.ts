import { NextResponse } from "next/server";
import { updateListing } from "@/server/store";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { listPrice, warrantyDays } = await req.json();
    return NextResponse.json(updateListing(id, { listPrice, warrantyDays }));
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
