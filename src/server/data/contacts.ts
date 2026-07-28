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

const GOING_COLD_DAYS = 180;
const BIRTHDAY_LOOKAHEAD_DAYS = 14;

export async function getClientAttentionInsights(userId: string) {
  const [lastByContact, birthdayContacts] = await Promise.all([
    db.interaction.groupBy({ by: ["contactId"], where: { userId }, _max: { occurredAt: true } }),
    db.contact.findMany({
      where: { userId, birthday: { not: null } },
      select: { id: true, fullName: true, birthday: true },
    }),
  ]);

  const contactIds = lastByContact.map((l) => l.contactId);
  const contacts = contactIds.length
    ? await db.contact.findMany({
        where: { id: { in: contactIds }, relationship: "CLIENT" },
        select: { id: true, fullName: true, phone: true, email: true },
      })
    : [];
  const contactById = new Map(contacts.map((c) => [c.id, c]));

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - GOING_COLD_DAYS);

  const goingCold = lastByContact
    .filter((l) => l._max.occurredAt && l._max.occurredAt < cutoff && contactById.has(l.contactId))
    .map((l) => ({ ...contactById.get(l.contactId)!, lastPurchase: l._max.occurredAt! }))
    .sort((a, b) => a.lastPurchase.getTime() - b.lastPurchase.getTime())
    .slice(0, 5);

  const today = new Date();
  const todayUTC = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());

  const upcomingBirthdays = birthdayContacts
    .map((c) => {
      const b = c.birthday!;
      let next = Date.UTC(today.getFullYear(), b.getUTCMonth(), b.getUTCDate());
      if (next < todayUTC) next = Date.UTC(today.getFullYear() + 1, b.getUTCMonth(), b.getUTCDate());
      const daysUntil = Math.round((next - todayUTC) / 86_400_000);
      return { id: c.id, fullName: c.fullName, daysUntil };
    })
    .filter((c) => c.daysUntil <= BIRTHDAY_LOOKAHEAD_DAYS)
    .sort((a, b) => a.daysUntil - b.daysUntil)
    .slice(0, 5);

  return { goingCold, upcomingBirthdays };
}
