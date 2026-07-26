import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Mail, ExternalLink, FileText, ChevronDown, ListTodo, ArchiveX } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { requireUser } from "@/lib/auth";
import { getGoogleConnections } from "@/server/data/integrations";
import { getEmailDrafts } from "@/server/data/email-drafts";
import { getOrClassifyEmails } from "@/server/data/email-classifications";
import { db } from "@/lib/db";
import { getValidAccessToken } from "@/lib/google/tokens";
import { listRecentMessages, type GmailMessage } from "@/lib/google/gmail-client";
import { DraftReplyButton } from "@/components/gmail/draft-reply-button";
import { VoiceNotesEditor } from "@/components/gmail/voice-notes-editor";
import { updateVoiceNotes } from "@/server/actions/email-drafts";

function MessageRow({
  message,
  connectionEmail,
  connectionId,
  needsAction,
  showDraftButton = true,
}: {
  message: GmailMessage;
  connectionEmail: string;
  connectionId: string;
  needsAction: boolean;
  showDraftButton?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-3 py-3 hover:bg-muted/60">
      <a
        href={`https://mail.google.com/mail/?authuser=${encodeURIComponent(connectionEmail)}#all/${message.threadId}`}
        target="_blank"
        rel="noopener noreferrer"
        className="min-w-0 flex-1"
      >
        <div className="flex flex-wrap items-center gap-1.5">
          {message.unread && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />}
          <span className={cn("truncate text-sm", message.unread ? "font-semibold" : "font-medium")}>
            {message.subject}
          </span>
          {needsAction && (
            <Badge variant="outline" className="gap-1 border-amber-300 text-[10px] text-amber-700 dark:text-amber-400">
              <ListTodo className="h-2.5 w-2.5" />
              To-do
            </Badge>
          )}
        </div>
        <p className="truncate text-xs text-muted-foreground">{message.from}</p>
        <p className="truncate text-xs text-muted-foreground">{message.snippet}</p>
      </a>
      <div className="flex shrink-0 flex-col items-end gap-1.5">
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          {message.date && formatDistanceToNow(new Date(message.date), { addSuffix: true })}
          <ExternalLink className="h-3 w-3" />
        </span>
        {showDraftButton && <DraftReplyButton connectionId={connectionId} messageId={message.id} />}
      </div>
    </div>
  );
}

export default async function GmailPage({
  searchParams,
}: {
  searchParams: Promise<{ account?: string; pageToken?: string }>;
}) {
  const { account, pageToken } = await searchParams;
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

  const mainMessages: GmailMessage[] = [];
  const reviewMessages: GmailMessage[] = [];
  let nextPageToken: string | null = null;
  const needsActionIds = new Set<string>();
  let error: string | null = null;

  try {
    const connectionRow = await db.googleAccountConnection.findUniqueOrThrow({
      where: { id: activeConnection.id, userId: user.id },
    });
    const accessToken = await getValidAccessToken(connectionRow);
    const page = await listRecentMessages(accessToken, { maxResults: 20, pageToken });
    nextPageToken = page.nextPageToken;

    const classifications = await getOrClassifyEmails(
      user.id,
      page.messages.map((m) => ({ id: m.id, subject: m.subject, from: m.from, snippet: m.snippet })),
    );

    for (const m of page.messages) {
      const c = classifications.get(m.id);
      if (c?.isSpam) reviewMessages.push(m);
      else mainMessages.push(m);
      if (c?.needsAction) needsActionIds.add(m.id);
    }
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

      <VoiceNotesEditor initialNotes={user.voiceNotes} onSave={updateVoiceNotes} />

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
          ) : mainMessages.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">Inbox zero. Nothing here.</p>
          ) : (
            <div className="flex flex-col divide-y">
              {mainMessages.map((m) => (
                <MessageRow
                  key={m.id}
                  message={m}
                  connectionEmail={activeConnection.email}
                  connectionId={activeConnection.id}
                  needsAction={needsActionIds.has(m.id)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {!error && nextPageToken && (
        <Button
          variant="outline"
          size="sm"
          nativeButton={false}
          className="w-fit gap-1.5 self-center"
          render={<Link href={`/gmail?account=${activeConnection.id}&pageToken=${nextPageToken}`} />}
        >
          <ChevronDown className="h-4 w-4" />
          Load older messages
        </Button>
      )}

      {!error && reviewMessages.length > 0 && (
        <details className="group rounded-lg border">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-3 py-2 text-sm font-medium text-muted-foreground marker:content-none hover:text-foreground">
            <span className="flex items-center gap-1.5">
              <ArchiveX className="h-3.5 w-3.5" />
              Needs review — likely spam or automated ({reviewMessages.length})
            </span>
            <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
          </summary>
          <div className="flex flex-col divide-y border-t px-3">
            {reviewMessages.map((m) => (
              <MessageRow
                key={m.id}
                message={m}
                connectionEmail={activeConnection.email}
                connectionId={activeConnection.id}
                needsAction={false}
                showDraftButton={false}
              />
            ))}
          </div>
        </details>
      )}

      {!error && mainMessages.length > 0 && (
        <Badge variant="outline" className="w-fit text-[10px]">
          Read-only — click any message to open it in Gmail
        </Badge>
      )}
    </div>
  );
}
