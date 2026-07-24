import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const q = new URL(request.url).searchParams.get("q")?.trim();
  if (!q) return NextResponse.json({ tasks: [], projects: [] });

  const [tasks, projects] = await Promise.all([
    db.task.findMany({
      where: { userId: user.id, title: { contains: q, mode: "insensitive" } },
      select: { id: true, title: true, status: true },
      take: 5,
    }),
    db.project.findMany({
      where: { userId: user.id, title: { contains: q, mode: "insensitive" } },
      select: { id: true, title: true, status: true },
      take: 5,
    }),
  ]);

  return NextResponse.json({ tasks, projects });
}
