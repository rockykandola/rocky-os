"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Sun } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { saveMorningPlan } from "@/server/actions/daily-plan";
import type { DailyPlan } from "@/generated/prisma/client";
import type { TaskWithProject } from "@/server/data/tasks";

export function MorningPlanForm({
  plan,
  candidates,
}: {
  plan: DailyPlan | null;
  candidates: TaskWithProject[];
}) {
  const [editing, setEditing] = useState(!plan);
  const [intentions, setIntentions] = useState(plan?.intentions ?? "");
  const [selected, setSelected] = useState<string[]>(plan?.taskIds ?? []);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function toggle(id: string) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function submit() {
    startTransition(async () => {
      await saveMorningPlan({ intentions, taskIds: selected });
      setEditing(false);
      router.refresh();
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Sun className="h-4 w-4 text-primary" />
          Morning plan
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {!editing && plan ? (
          <>
            {plan.aiSummary && (
              <div className="flex items-start gap-2 rounded-lg bg-primary/5 p-3 text-sm">
                <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <p>{plan.aiSummary}</p>
              </div>
            )}
            {plan.intentions && <p className="text-sm text-muted-foreground">{plan.intentions}</p>}
            <Button variant="outline" size="sm" className="self-start" onClick={() => setEditing(true)}>
              Edit plan
            </Button>
          </>
        ) : (
          <>
            <Textarea
              value={intentions}
              onChange={(e) => setIntentions(e.target.value)}
              placeholder="What's your intention for today?"
              rows={3}
            />
            <div>
              <p className="mb-2 text-xs font-medium text-muted-foreground">Pick what you&apos;ll work on</p>
              <div className="flex max-h-56 flex-col gap-1 overflow-y-auto">
                {candidates.length === 0 && (
                  <p className="text-sm text-muted-foreground">No open tasks yet — add some from the Tasks page.</p>
                )}
                {candidates.map((task) => (
                  <label key={task.id} className="flex cursor-pointer items-center gap-2 rounded-md px-1 py-1.5 hover:bg-muted">
                    <Checkbox checked={selected.includes(task.id)} onCheckedChange={() => toggle(task.id)} />
                    <span className="text-sm">{task.title}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2">
              {plan && (
                <Button variant="ghost" onClick={() => setEditing(false)}>
                  Cancel
                </Button>
              )}
              <Button onClick={submit} disabled={isPending} className="gap-1.5">
                <Sparkles className="h-4 w-4" />
                {isPending ? "Generating…" : "Generate my plan"}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
