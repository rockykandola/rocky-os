import { Brain } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { requireUser } from "@/lib/auth";
import { getBrainDumpItems } from "@/server/data/brain-dump";
import { aiEnabled } from "@/lib/ai/openai";
import { BrainDumpItemCard } from "@/components/brain-dump/brain-dump-item-card";
import { CategorizeAllButton } from "@/components/brain-dump/categorize-all-button";

export default async function BrainDumpPage() {
  const user = await requireUser();
  const items = await getBrainDumpItems(user.id);
  const pendingCount = items.filter((i) => i.status === "PENDING").length;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Brain Dump</h1>
          <p className="text-sm text-muted-foreground">
            Everything you&apos;ve captured, waiting to be sorted into tasks, projects, or notes.
          </p>
        </div>
        <CategorizeAllButton disabled={pendingCount === 0} />
      </div>

      {!aiEnabled && (
        <div className="rounded-lg border border-dashed p-3 text-xs text-muted-foreground">
          Set <code className="rounded bg-muted px-1">OPENAI_API_KEY</code> to enable AI sorting — using a simple
          keyword fallback for now.
        </div>
      )}

      {items.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-16 text-center">
            <Brain className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Nothing here yet. Use Quick Capture in the top bar to dump anything on your mind.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((item) => (
            <BrainDumpItemCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
