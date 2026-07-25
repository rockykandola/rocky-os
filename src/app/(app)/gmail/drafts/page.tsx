import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { requireUser } from "@/lib/auth";
import { getEmailDrafts } from "@/server/data/email-drafts";
import { DraftCard } from "@/components/gmail/draft-card";

export default async function GmailDraftsPage() {
  const user = await requireUser();
  const drafts = await getEmailDrafts(user.id);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div>
        <Link
          href="/gmail"
          className="mb-2 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Gmail
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">Drafts</h1>
        <p className="text-sm text-muted-foreground">
          AI-drafted replies, kept here for you to copy or download — nothing gets sent automatically.
        </p>
      </div>

      {drafts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-16 text-center">
            <FileText className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              No drafts yet. Click &quot;Draft reply&quot; on a message in Gmail to generate one.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {drafts.map((draft) => (
            <DraftCard key={draft.id} draft={draft} />
          ))}
        </div>
      )}
    </div>
  );
}
