import { parseCSV } from "./csv";

export type HubspotClient = {
  key: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  company: string | null;
};

export type HubspotDeal = {
  key: string;
  occurredAt: Date;
  summary: string;
};

function normalizeHeader(h: string): string {
  return h.trim().toLowerCase();
}

function parseDate(value: string): Date | null {
  if (!value.trim()) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  // Source exports have occasional typo'd years (e.g. "5/14/0120" instead of "5/14/2020") —
  // treat anything outside a sane business-record range as unparseable rather than display it.
  const year = date.getFullYear();
  if (year < 2000 || year > new Date().getFullYear() + 1) return null;
  return date;
}

/** Parses a HubSpot "deals" export (one row per sale) into deduped clients + a per-deal interaction log. */
export function parseHubspotDealsCSV(csvText: string): { clients: HubspotClient[]; deals: HubspotDeal[] } {
  const rows = parseCSV(csvText);
  if (rows.length < 2) return { clients: [], deals: [] };

  const header = rows[0].map(normalizeHeader);
  const col = (name: string) => header.indexOf(normalizeHeader(name));

  const idx = {
    date: col("Date"),
    firstName: col("Contact First Name"),
    lastName: col("Contact Last Name"),
    company: col("Company Name"),
    dealName: col("Deal Name"),
    price: col("Price"),
    itemsSold: col("Items Sold"),
    cogs: col("COGS"),
    notes: col("Notes"),
    paymentType: col("Payment Type"),
    phone: col("Phone"),
    email: col("Email"),
    dealStage: col("Deal Stage"),
    leadSource: col("Lead Source"),
  };

  const clientsByKey = new Map<string, HubspotClient>();
  const deals: HubspotDeal[] = [];

  for (const row of rows.slice(1)) {
    const get = (i: number) => (i >= 0 ? (row[i] ?? "").trim() : "");

    const phone = get(idx.phone);
    const email = get(idx.email).toLowerCase();
    const key = phone || email;
    if (!key) continue;

    const firstName = get(idx.firstName);
    const lastName = get(idx.lastName);
    const fullName = [firstName, lastName].filter(Boolean).join(" ").trim() || phone || email;
    const company = get(idx.company);

    if (!clientsByKey.has(key)) {
      clientsByKey.set(key, {
        key,
        fullName,
        email: email || null,
        phone: phone || null,
        // Skip a "company" that's just the client's own name repeated.
        company: company && company !== fullName ? company : null,
      });
    }

    const occurredAt = parseDate(get(idx.date)) ?? new Date();
    const parts = [
      get(idx.dealName) && `Deal: ${get(idx.dealName)}`,
      get(idx.price) && `Price: ${get(idx.price)}`,
      get(idx.cogs) && `COGS: ${get(idx.cogs)}`,
      get(idx.itemsSold) && `Items: ${get(idx.itemsSold)}`,
      get(idx.paymentType) && `Payment: ${get(idx.paymentType)}`,
      get(idx.dealStage) && `Stage: ${get(idx.dealStage)}`,
      get(idx.leadSource) && get(idx.leadSource) !== "?" && `Source: ${get(idx.leadSource)}`,
      get(idx.notes) && `Notes: ${get(idx.notes)}`,
    ].filter(Boolean);

    if (parts.length > 0) {
      deals.push({ key, occurredAt, summary: parts.join(" · ") });
    }
  }

  return { clients: [...clientsByKey.values()], deals };
}
