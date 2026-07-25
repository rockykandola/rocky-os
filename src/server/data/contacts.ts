import "server-only";
import { db } from "@/lib/db";

export async function getContacts(userId: string) {
  return db.contact.findMany({
    where: { userId },
    orderBy: { fullName: "asc" },
  });
}

export async function getContactDetail(userId: string, id: string) {
  return db.contact.findUnique({
    where: { id, userId },
    include: { interactions: { orderBy: { occurredAt: "desc" } } },
  });
}

export type ContactDetail = NonNullable<Awaited<ReturnType<typeof getContactDetail>>>;
