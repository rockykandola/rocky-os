"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, X, ListChecks, FolderKanban, StickyNote } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  categorizeItem,
  convertToTask,
  convertToProject,
  convertToNote,
  dismissItem,
} from "@/server/actions/brain-dump";
import type { BrainDumpItem } from "@/generated/prisma/client";

const TYPE_META: Record<string, { label: string; icon: typeof ListChecks }> = {
  TASK: { label: "Task", icon: ListChecks },
  PROJECT: { label: "Project", icon: FolderKanban },
  NOTE: { label: "Note", icon: StickyNote },
  EVENT: { label: "Event", icon: ListChecks },
  CONTACT: { label: "Contact", icon: StickyNote },
  JOURNAL: { label: "Journal", icon: StickyNote },
  UNSURE: { label: "Unsure", icon: StickyNote },
};

export function BrainDumpItemCard({ item }: { item: BrainDumpItem }) {
  const [isPending, startTransition] = useTransition();
  const [convertAs, setConvertAs] = useState(item.suggestedType ?? "TASK");
  const router = useRouter();

  function runCategorize() {
    startTransition(async () => {
      await categorizeItem(item.id);
      router.refresh();
    });
  }

  function runConvert() {
    const title = item.suggestedTitle ?? item.rawText.slice(0, 100);
    startTransition(async () => {
      if (convertAs === "PROJECT") await convertToProject(item.id, title);
      else if (convertAs === "TASK") await convertToTask(item.id, title);
      else await convertToNote(item.id, title);
      router.refresh();
    });
  }

  function runDismiss() {
    startTransition(async () => {
      await dismissItem(item.id);
      router.refresh();
    });
  }

  const meta = item.suggestedType ? TYPE_META[item.suggestedType] : null;
  const Icon = meta?.icon;

  return (
    <div className="flex flex-col gap-3 rounded-lg border p-4">
      <p className="whitespace-pre-wrap text-sm">{item.rawText}</p>

      {item.status === "PENDING" ? (
        <div className="flex items-center justify-between">
          <Button size="sm" variant="secondary" className="gap-1.5" disabled={isPending} onClick={runCategorize}>
            <Sparkles className="h-3.5 w-3.5" />
            Sort with AI
          </Button>
          <Button size="sm" variant="ghost" className="gap-1.5 text-muted-foreground" disabled={isPending} onClick={runDismiss}>
            <X className="h-3.5 w-3.5" />
            Dismiss
          </Button>
        </div>
      ) : (
        <>
          {meta && Icon && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Badge variant="outline" className="gap-1 text-[10px]">
                <Icon className="h-3 w-3" />
                Suggested: {meta.label}
              </Badge>
              {item.aiRationale && <span className="line-clamp-1">{item.aiRationale}</span>}
            </div>
          )}
          <div className="flex flex-wrap items-center gap-2">
            <Select value={convertAs} onValueChange={(value) => value && setConvertAs(value)}>
              <SelectTrigger className="w-36">
                <SelectValue>
                  {(value: string) =>
                    ({ TASK: "Convert to Task", PROJECT: "Convert to Project", NOTE: "Convert to Note" })[value] ?? value
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TASK">Convert to Task</SelectItem>
                <SelectItem value="PROJECT">Convert to Project</SelectItem>
                <SelectItem value="NOTE">Convert to Note</SelectItem>
              </SelectContent>
            </Select>
            <Button size="sm" disabled={isPending} onClick={runConvert}>
              Convert
            </Button>
            <Button size="sm" variant="ghost" className="gap-1.5 text-muted-foreground" disabled={isPending} onClick={runDismiss}>
              <X className="h-3.5 w-3.5" />
              Dismiss
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
