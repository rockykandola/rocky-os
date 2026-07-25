import "server-only";
import { db } from "@/lib/db";

export async function getEmailDrafts(userId: string) {
  return db.emailDraft.findMany({
    where: { userId },
    include: { connection: { select: { email: true } } },
    orderBy: { createdAt: "desc" },
  });
}
