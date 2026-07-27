import "server-only";

export type GmailMessage = {
  id: string;
  threadId: string;
  snippet: string;
  subject: string;
  from: string;
  date: string;
  unread: boolean;
};

async function googleFetch<T>(url: string, accessToken: string): Promise<T> {
  const res = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
  if (!res.ok) throw new Error(`Gmail API error (${res.status}): ${await res.text()}`);
  return res.json();
}

function headerValue(headers: { name: string; value: string }[] | undefined, name: string) {
  const raw = headers?.find((h) => h.name.toLowerCase() === name.toLowerCase())?.value ?? "";
  return sanitizeText(raw);
}

export type GmailMessagePage = {
  messages: GmailMessage[];
  nextPageToken: string | null;
};

/** Lists the most recent messages (default: inbox) with just enough metadata for a list view. */
export async function listRecentMessages(
  accessToken: string,
  { maxResults = 20, q, pageToken }: { maxResults?: number; q?: string; pageToken?: string } = {},
): Promise<GmailMessagePage> {
  const listUrl = new URL("https://gmail.googleapis.com/gmail/v1/users/me/messages");
  listUrl.searchParams.set("maxResults", String(maxResults));
  listUrl.searchParams.set("labelIds", "INBOX");
  if (q) listUrl.searchParams.set("q", q);
  if (pageToken) listUrl.searchParams.set("pageToken", pageToken);

  const list = await googleFetch<{
    messages?: { id: string; threadId: string }[];
    nextPageToken?: string;
  }>(listUrl.toString(), accessToken);
  if (!list.messages?.length) return { messages: [], nextPageToken: null };

  const messages = await Promise.all(
    list.messages.map(async (m) => {
      const url = new URL(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${m.id}`);
      url.searchParams.set("format", "metadata");
      ["From", "Subject", "Date"].forEach((h) => url.searchParams.append("metadataHeaders", h));

      const detail = await googleFetch<{
        id: string;
        threadId: string;
        snippet: string;
        labelIds?: string[];
        payload?: { headers?: { name: string; value: string }[] };
      }>(url.toString(), accessToken);

      return {
        id: detail.id,
        threadId: detail.threadId,
        snippet: detail.snippet,
        subject: headerValue(detail.payload?.headers, "Subject") || "(no subject)",
        from: headerValue(detail.payload?.headers, "From"),
        date: headerValue(detail.payload?.headers, "Date"),
        unread: detail.labelIds?.includes("UNREAD") ?? false,
      };
    }),
  );

  return { messages, nextPageToken: list.nextPageToken ?? null };
}

type GmailPart = {
  mimeType?: string;
  body?: { data?: string };
  parts?: GmailPart[];
};

function decodeBase64Url(data: string): string {
  return Buffer.from(data.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf-8");
}

const HTML_ENTITIES: Record<string, string> = {
  "&amp;": "&",
  "&#39;": "'",
  "&apos;": "'",
  "&quot;": '"',
  "&lt;": "<",
  "&gt;": ">",
  "&nbsp;": " ",
};

// Common "smart" punctuation from Word/Outlook-style signatures, normalized to plain ASCII.
// Anything left outside Latin-1 gets stripped: it's not just an AI-prompt nicety — Node's fetch
// throws if a non-Latin-1 character ends up in an HTTP header anywhere downstream (which bit us
// with a bullet character, U+2022, in a real signature), so this text needs to be safe at the
// source rather than sanitized ad hoc at every call site.
const SMART_CHARS: Record<string, string> = {
  "‘": "'",
  "’": "'",
  "“": '"',
  "”": '"',
  "–": "-",
  "—": "-",
  "…": "...",
  "•": "-",
};

export function sanitizeText(text: string): string {
  return text
    .replace(/[‘’“”–—…•]/g, (m) => SMART_CHARS[m])
    .replace(/[^\x00-\xFF]/g, "");
}

function decodeHtmlEntities(text: string): string {
  const decoded = text
    .replace(/&amp;|&#39;|&apos;|&quot;|&lt;|&gt;|&nbsp;/g, (m) => HTML_ENTITIES[m])
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)));
  return sanitizeText(decoded);
}

function findPlainTextBody(part: GmailPart | undefined): string | null {
  if (!part) return null;
  if (part.mimeType === "text/plain" && part.body?.data) {
    return decodeBase64Url(part.body.data);
  }
  for (const child of part.parts ?? []) {
    const found = findPlainTextBody(child);
    if (found) return found;
  }
  return null;
}

export type GmailMessageDetail = {
  id: string;
  threadId: string;
  subject: string;
  from: string;
  body: string;
};

/** Fetches a message's plain-text body (falls back to the snippet if no text/plain part exists). */
export async function getMessageDetail(accessToken: string, messageId: string): Promise<GmailMessageDetail> {
  const url = new URL(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}`);
  url.searchParams.set("format", "full");

  const detail = await googleFetch<{
    id: string;
    threadId: string;
    snippet: string;
    payload?: GmailPart & { headers?: { name: string; value: string }[] };
  }>(url.toString(), accessToken);

  const body = decodeHtmlEntities(findPlainTextBody(detail.payload) ?? detail.snippet);

  return {
    id: detail.id,
    threadId: detail.threadId,
    subject: headerValue(detail.payload?.headers, "Subject") || "(no subject)",
    from: headerValue(detail.payload?.headers, "From"),
    body: body.trim(),
  };
}

/** Cuts a plain-text email body off at the start of a quoted reply chain, if any. */
export function stripQuotedReply(text: string): string {
  const markers = [
    /\r?\n\s*On .{0,150} wrote:\s*\r?\n/i,
    /\r?\n-{2,}\s?Original Message\s?-{2,}/i,
    /\r?\nFrom:.{0,150}\r?\nSent:/i,
    /\r?\n>[\s\S]*$/,
  ];
  let cut = text.length;
  for (const marker of markers) {
    const match = text.match(marker);
    if (match?.index !== undefined && match.index < cut) cut = match.index;
  }
  return text.slice(0, cut).trim();
}

export type ThreadMessage = {
  id: string;
  from: string;
  date: string;
  body: string;
};

/** Fetches every message in a thread, in order — used to give a draft the full conversation. */
export async function getThreadMessages(accessToken: string, threadId: string): Promise<ThreadMessage[]> {
  const url = new URL(`https://gmail.googleapis.com/gmail/v1/users/me/threads/${threadId}`);
  url.searchParams.set("format", "full");

  const thread = await googleFetch<{
    messages?: { id: string; payload?: GmailPart & { headers?: { name: string; value: string }[] } }[];
  }>(url.toString(), accessToken);

  return (thread.messages ?? []).map((m) => ({
    id: m.id,
    from: headerValue(m.payload?.headers, "From"),
    date: headerValue(m.payload?.headers, "Date"),
    body: decodeHtmlEntities(findPlainTextBody(m.payload) ?? "").trim(),
  }));
}

/** Parses a From/To header value into individual {name, email} pairs (handles comma-separated lists). */
export function parseAddressList(headerValue: string): { name: string; email: string }[] {
  const results: { name: string; email: string }[] = [];
  const regex = /(?:"([^"]*)"|([^,<]*))\s*<([^>]+)>|([^\s,<>]+@[^\s,<>]+)/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(headerValue)) !== null) {
    const email = (match[3] ?? match[4] ?? "").trim().toLowerCase();
    if (!email.includes("@")) continue;
    const name = sanitizeText((match[1] ?? match[2] ?? "").trim());
    results.push({ name, email });
  }
  return results;
}

async function mapWithConcurrency<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;
  async function worker() {
    while (next < items.length) {
      const i = next++;
      results[i] = await fn(items[i]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

/** Scans recent inbox + sent messages for From/To addresses — used to build a real contacts list. */
export async function listAddressCandidates(accessToken: string, maxPerFolder = 60): Promise<{ name: string; email: string }[]> {
  const candidates: { name: string; email: string }[] = [];

  for (const labelId of ["INBOX", "SENT"]) {
    const listUrl = new URL("https://gmail.googleapis.com/gmail/v1/users/me/messages");
    listUrl.searchParams.set("maxResults", String(maxPerFolder));
    listUrl.searchParams.set("labelIds", labelId);

    const list = await googleFetch<{ messages?: { id: string }[] }>(listUrl.toString(), accessToken);
    if (!list.messages?.length) continue;

    const details = await mapWithConcurrency(list.messages, 10, async (m) => {
      const url = new URL(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${m.id}`);
      url.searchParams.set("format", "metadata");
      ["From", "To"].forEach((h) => url.searchParams.append("metadataHeaders", h));
      return googleFetch<{ payload?: { headers?: { name: string; value: string }[] } }>(url.toString(), accessToken);
    });

    for (const detail of details) {
      const from = detail.payload?.headers?.find((h) => h.name.toLowerCase() === "from")?.value;
      const to = detail.payload?.headers?.find((h) => h.name.toLowerCase() === "to")?.value;
      if (from) candidates.push(...parseAddressList(from));
      if (to) candidates.push(...parseAddressList(to));
    }
  }

  return candidates;
}

/** Pulls a handful of recently sent messages to use as writing-style reference. */
export async function listSentSamples(accessToken: string, maxResults = 5): Promise<string[]> {
  const listUrl = new URL("https://gmail.googleapis.com/gmail/v1/users/me/messages");
  listUrl.searchParams.set("maxResults", String(maxResults));
  listUrl.searchParams.set("q", "in:sent");

  const list = await googleFetch<{ messages?: { id: string }[] }>(listUrl.toString(), accessToken);
  if (!list.messages?.length) return [];

  const bodies = await Promise.all(
    list.messages.map(async (m) => {
      const url = new URL(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${m.id}`);
      url.searchParams.set("format", "full");
      const detail = await googleFetch<{ payload?: GmailPart }>(url.toString(), accessToken);
      const body = decodeHtmlEntities(findPlainTextBody(detail.payload) ?? "").trim();
      return stripQuotedReply(body);
    }),
  );

  return bodies.filter((b) => b.length > 15 && b.length < 3000);
}
