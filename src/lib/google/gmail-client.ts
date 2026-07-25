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
