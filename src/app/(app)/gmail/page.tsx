import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Mail, ExternalLink, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { requireUser } from "@/lib/auth";
import { getGoogleConnections } from "@/server/data/integrations";
import { getEmailDrafts } from "@/server/data/email-drafts";
import { db } from "@/lib/db";
import { getValidAccessToken } from "@/lib/google/tokens";
import { listRecentMessages } from "@/lib/google/gmail-client";
import { DraftReplyButton } from "@/components/gmail/draft-reply-button";

export default async function GmailPage({
  searchParams,
}: {
  searchParams: Promise<{ account?: string }>;
}) {
  const { account } = await searchParams;
  const user = await requireUser();
  const connections = await getGoogleConnections(user.id);

  if (connections.length === 0) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Gmail</h1>
          <p className="text-sm text-muted-foreground">A quick glance across all your inboxes.</p>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <Mail className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              No Google accounts connected yet. Connect one under Integrations to see your inbox here.
            </p>
            <Link href="/integrations" className="text-sm font-medium underline underline-offset-4">
              Go to Integrations
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const activeConnectionId = account ?? connections[0].id;
  const activeConnection = connections.find((c) => c.id === activeConnectionId) ?? connections[0];
  const draftCount = (await getEmailDrafts(user.id)).length;

  let messages: Awaited<ReturnType<typeof listRecentMessages>> = [];
  let error: string | null = null;
  try {
    const connectionRow = await db.googleAccountConnection.findUniqueOrThrow({
      where: { id: activeConnection.id, userId: user.id },
    });
    const accessToken = await getValidAccessToken(connectionRow);
    messages = await listRecentMessages(accessToken, { maxResults: 20 });
  } catch {
    error = "Couldn't load this inbox — try reconnecting this account under Integrations (Gmail access may need to be re-granted).";
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Gmail</h1>
          <p className="text-sm text-muted-foreground">A quick glance across all your inboxes.</p>
        </div>
        <Link
          href="/gmail/drafts"
          className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <FileText className="h-4 w-4" />
          Drafts {draftCount > 0 && `(${draftCount})`}
        </Link>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {connections.map((c) => (
          <Link
            key={c.id}
            href={`/gmail?account=${c.id}`}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium",
              c.id === activeConnection.id
                ? "border-primary bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted",
            )}
          >
            {c.email}
          </Link>
        ))}
      </div>

      <Card>
        <CardContent className="py-2">
          {error ? (
            <p className="py-10 text-center text-sm text-muted-foreground">{error}</p>
          ) : messages.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">Inbox zero. Nothing here.</p>
          ) : (
            <div className="flex flex-col divide-y">
              {messages.map((m) => (
                <div key={m.id} className="flex items-start justify-between gap-3 py-3 hover:bg-muted/60">
                  <a
                    href={`https://mail.google.com/mail/?authuser=${encodeURIComponent(activeConnection.email)}#all/${m.threadId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="min-w-0 flex-1"
                  >
                    <div className="flex items-center gap-2">
                      {m.unread && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />}
                      <span className={cn("truncate text-sm", m.unread ? "font-semibold" : "font-medium")}>
                        {m.subject}
                      </span>
                    </div>
                    <p className="truncate text-xs text-muted-foreground">{m.from}</p>
                    <p className="truncate text-xs text-muted-foreground">{m.snippet}</p>
                  </a>
                  <div className="flex shrink-0 flex-col items-end gap-1.5">
                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      {m.date && formatDistanceToNow(new Date(m.date), { addSuffix: true })}
                      <ExternalLink className="h-3 w-3" />
                    </span>
                    <DraftReplyButton connectionId={activeConnection.id} messageId={m.id} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      {!error && messages.length > 0 && (
        <Badge variant="outline" className="w-fit text-[10px]">
          Read-only — click any message to open it in Gmail
        </Badge>
      )}
    </div>
  );
}
