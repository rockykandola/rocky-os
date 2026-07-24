import "server-only";
import { db } from "@/lib/db";

export async function getBrainDumpItems(userId: string) {
  return db.brainDumpItem.findMany({
    where: { userId, status: { in: ["PENDING", "CATEGORIZED"] } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getRecentlyConvertedItems(userId: string) {
  return db.brainDumpItem.findMany({
    where: { userId, status: { in: ["CONVERTED", "DISMISSED"] } },
    orderBy: { updatedAt: "desc" },
    take: 20,
  });
}
