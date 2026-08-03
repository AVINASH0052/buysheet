import { NextResponse } from "next/server";
import { gradeIntake } from "@/server/grade";
import { CATALOG } from "@/server/catalog";
import type { IntakeInput } from "@/server/types";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as IntakeInput;
    const catalog = CATALOG.find((c) => c.id === body.catalogId);
    if (!catalog) return NextResponse.json({ error: "Unknown catalog model" }, { status: 400 });
    return NextResponse.json(gradeIntake(body, catalog));
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
