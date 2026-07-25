import "server-only";
import { db } from "@/lib/db";
import { startOfToday } from "@/server/data/tasks";

export async function getTodaysJournalEntry(userId: string, date = startOfToday()) {
  return db.journalEntry.findUnique({ where: { userId_entryDate: { userId, entryDate: date } } });
}

export async function getJournalHistory(userId: string, date = startOfToday()) {
  return db.journalEntry.findMany({
    where: { userId, entryDate: { lt: date } },
    orderBy: { entryDate: "desc" },
    take: 30,
  });
}
