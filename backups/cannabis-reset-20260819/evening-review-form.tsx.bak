"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Moon } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { saveEveningReview } from "@/server/actions/daily-plan";
import type { DailyPlan } from "@/generated/prisma/client";

export function EveningReviewForm({ plan }: { plan: DailyPlan | null }) {
  const [editing, setEditing] = useState(!plan);
  const [wins, setWins] = useState(plan?.wins ?? "");
  const [challenges, setChallenges] = useState(plan?.challenges ?? "");
  const [gratitude, setGratitude] = useState(plan?.gratitude ?? "");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function submit() {
    startTransition(async () => {
      await saveEveningReview({ wins, challenges, gratitude });
      setEditing(false);
      router.refresh();
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Moon className="h-4 w-4 text-primary" />
          Evening review
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
            <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-3">
              {plan.wins && (
                <div>
                  <p className="font-medium text-foreground">Wins</p>
                  <p className="whitespace-pre-wrap">{plan.wins}</p>
                </div>
              )}
              {plan.challenges && (
                <div>
                  <p className="font-medium text-foreground">Challenges</p>
                  <p className="whitespace-pre-wrap">{plan.challenges}</p>
                </div>
              )}
              {plan.gratitude && (
                <div>
                  <p className="font-medium text-foreground">Grateful for</p>
                  <p className="whitespace-pre-wrap">{plan.gratitude}</p>
                </div>
              )}
            </div>
            <Button variant="outline" size="sm" className="self-start" onClick={() => setEditing(true)}>
              Edit review
            </Button>
          </>
        ) : (
          <>
            <div className="flex flex-col gap-2">
              <Label>What went well today?</Label>
              <Textarea value={wins} onChange={(e) => setWins(e.target.value)} rows={2} />
            </div>
            <div className="flex flex-col gap-2">
              <Label>What was challenging?</Label>
              <Textarea value={challenges} onChange={(e) => setChallenges(e.target.value)} rows={2} />
            </div>
            <div className="flex flex-col gap-2">
              <Label>What are you grateful for?</Label>
              <Textarea value={gratitude} onChange={(e) => setGratitude(e.target.value)} rows={2} />
            </div>
            <div className="flex justify-end gap-2">
              {plan && (
                <Button variant="ghost" onClick={() => setEditing(false)}>
                  Cancel
                </Button>
              )}
              <Button onClick={submit} disabled={isPending} className="gap-1.5">
                <Sparkles className="h-4 w-4" />
                {isPending ? "Reflecting…" : "Generate my reflection"}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
