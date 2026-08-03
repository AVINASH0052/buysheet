import { NextResponse } from "next/server";
import { getDevice, twinsOnShelf } from "@/server/store";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const row = getDevice(id);
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({
    ...row,
    twins: twinsOnShelf(row.catalogId, row.id).map((t) => ({
      id: t.id,
      grade: t.grade,
      listPrice: t.listPrice,
      offerPrice: t.offerPrice,
      color: t.color,
    })),
  });
}
