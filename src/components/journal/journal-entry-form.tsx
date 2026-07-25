"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, BookOpen } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { MOOD_EMOJI } from "@/lib/mood-format";
import { saveTodaysJournalEntry } from "@/server/actions/journal";
import type { JournalEntry } from "@/generated/prisma/client";

export function JournalEntryForm({ entry }: { entry: JournalEntry | null }) {
  const [editing, setEditing] = useState(!entry);
  const [title, setTitle] = useState(entry?.title ?? "");
  const [body, setBody] = useState(entry?.body ?? "");
  const [mood, setMood] = useState<number | null>(entry?.mood ?? null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function submit() {
    if (!body.trim()) return;
    startTransition(async () => {
      await saveTodaysJournalEntry({ title: title || null, body, mood });
      setEditing(false);
      router.refresh();
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <BookOpen className="h-4 w-4 text-primary" />
          Today&apos;s entry
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {!editing && entry ? (
          <>
            {entry.mood && <span className="text-2xl">{MOOD_EMOJI[entry.mood]}</span>}
            {entry.title && <p className="font-medium">{entry.title}</p>}
            <p className="whitespace-pre-wrap text-sm text-muted-foreground">{entry.body}</p>
            {entry.aiSummary && (
              <div className="flex items-start gap-2 rounded-lg bg-primary/5 p-3 text-sm">
                <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <p>{entry.aiSummary}</p>
              </div>
            )}
            <Button variant="outline" size="sm" className="self-start" onClick={() => setEditing(true)}>
              Edit entry
            </Button>
          </>
        ) : (
          <>
            <div className="flex gap-1.5">
              {[1, 2, 3, 4, 5].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMood(mood === m ? null : m)}
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full border text-lg transition-colors",
                    mood === m ? "border-primary bg-primary/10" : "hover:bg-muted",
                  )}
                >
                  {MOOD_EMOJI[m]}
                </button>
              ))}
            </div>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title (optional)" />
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="What's on your mind today?"
              rows={5}
            />
            <div className="flex justify-end gap-2">
              {entry && (
                <Button variant="ghost" onClick={() => setEditing(false)}>
                  Cancel
                </Button>
              )}
              <Button onClick={submit} disabled={isPending || !body.trim()} className="gap-1.5">
                <Sparkles className="h-4 w-4" />
                {isPending ? "Saving…" : "Save entry"}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
