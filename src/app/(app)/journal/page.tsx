import { format } from "date-fns";
import { requireUser } from "@/lib/auth";
import { getTodaysJournalEntry, getJournalHistory } from "@/server/data/journal";
import { JournalEntryForm } from "@/components/journal/journal-entry-form";
import { MOOD_EMOJI } from "@/lib/mood-format";

export default async function JournalPage() {
  const user = await requireUser();
  const [today, history] = await Promise.all([
    getTodaysJournalEntry(user.id),
    getJournalHistory(user.id),
  ]);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Journal</h1>
        <p className="text-sm text-muted-foreground">A running record, one day at a time.</p>
      </div>

      <JournalEntryForm entry={today} />

      {history.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-medium text-muted-foreground">Past entries</h2>
          {history.map((entry) => (
            <div key={entry.id} className="rounded-lg border p-4">
              <div className="mb-1 flex items-center gap-2">
                {entry.mood && <span>{MOOD_EMOJI[entry.mood]}</span>}
                <span className="text-xs text-muted-foreground">{format(new Date(entry.entryDate), "MMM d, yyyy")}</span>
              </div>
              {entry.title && <p className="text-sm font-medium">{entry.title}</p>}
              <p className="line-clamp-3 whitespace-pre-wrap text-sm text-muted-foreground">{entry.body}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
