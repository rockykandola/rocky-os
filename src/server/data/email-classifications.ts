import "server-only";
import { db } from "@/lib/db";
import { classifyEmails, type TriageInput } from "@/lib/ai/email-triage";

export type ClassificationMap = Map<string, { isSpam: boolean; needsAction: boolean }>;

/** Returns cached triage results for these messages, classifying + caching any new ones. */
export async function getOrClassifyEmails(userId: string, messages: TriageInput[]): Promise<ClassificationMap> {
  const map: ClassificationMap = new Map();
  if (messages.length === 0) return map;

  const existing = await db.emailClassification.findMany({
    where: { userId, gmailMessageId: { in: messages.map((m) => m.id) } },
  });
  for (const e of existing) {
    map.set(e.gmailMessageId, { isSpam: e.isSpam, needsAction: e.needsAction });
  }

  const unclassified = messages.filter((m) => !map.has(m.id));
  if (unclassified.length > 0) {
    const results = await classifyEmails(unclassified);
    await db.emailClassification.createMany({
      data: results.map((r) => ({
        userId,
        gmailMessageId: r.id,
        isSpam: r.isSpam,
        needsAction: r.needsAction,
      })),
      skipDuplicates: true,
    });
    for (const r of results) {
      map.set(r.id, { isSpam: r.isSpam, needsAction: r.needsAction });
    }
  }

  return map;
}
