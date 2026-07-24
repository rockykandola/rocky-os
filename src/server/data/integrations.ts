import "server-only";
import { db } from "@/lib/db";

export async function getGoogleConnections(userId: string) {
  return db.googleAccountConnection.findMany({
    where: { userId },
    select: { id: true, email: true, lastImportedAt: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });
}
