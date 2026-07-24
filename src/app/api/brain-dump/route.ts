import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

const createSchema = z.object({ text: z.string().trim().min(1).max(2000) });

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  }

  const item = await db.brainDumpItem.create({
    data: { userId: user.id, rawText: parsed.data.text },
  });

  return NextResponse.json({ item }, { status: 201 });
}
