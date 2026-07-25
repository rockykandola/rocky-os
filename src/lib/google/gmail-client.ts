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
  return headers?.find((h) => h.name.toLowerCase() === name.toLowerCase())?.value ?? "";
}

/** Lists the most recent messages (default: inbox) with just enough metadata for a list view. */
export async function listRecentMessages(
  accessToken: string,
  { maxResults = 20, q }: { maxResults?: number; q?: string } = {},
): Promise<GmailMessage[]> {
  const listUrl = new URL("https://gmail.googleapis.com/gmail/v1/users/me/messages");
  listUrl.searchParams.set("maxResults", String(maxResults));
  listUrl.searchParams.set("labelIds", "INBOX");
  if (q) listUrl.searchParams.set("q", q);

  const list = await googleFetch<{ messages?: { id: string; threadId: string }[] }>(
    listUrl.toString(),
    accessToken,
  );
  if (!list.messages?.length) return [];

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

  return messages;
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

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;|&#39;|&apos;|&quot;|&lt;|&gt;|&nbsp;/g, (m) => HTML_ENTITIES[m])
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)));
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
