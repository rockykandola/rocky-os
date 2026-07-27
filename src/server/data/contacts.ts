import "server-only";
import { db } from "@/lib/db";

const DEFAULT_LIMIT = 60;

export async function getContacts(userId: string, opts?: { query?: string; limit?: number }) {
  const query = opts?.query?.trim();
  const where = {
    userId,
    ...(query
      ? {
          OR: [
            { fullName: { contains: query, mode: "insensitive" as const } },
            { email: { contains: query, mode: "insensitive" as const } },
            { phone: { contains: query, mode: "insensitive" as const } },
            { company: { contains: query, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [contacts, total] = await Promise.all([
    db.contact.findMany({ where, orderBy: { fullName: "asc" }, take: opts?.limit ?? DEFAULT_LIMIT }),
    db.contact.count({ where }),
  ]);

  return { contacts, total };
}

export async function getContactDetail(userId: string, id: string) {
  return db.contact.findUnique({
    where: { id, userId },
    include: { interactions: { orderBy: { occurredAt: "desc" } } },
  });
}

export type ContactDetail = NonNullable<Awaited<ReturnType<typeof getContactDetail>>>;
