"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { recordFinalCannabisSession } from "@/server/actions/project-foundation";

export function FinalCannabisSessionForm({
  defaultSessionAt,
  defaultLocation,
  defaultFeelings,
  defaultAmount,
  defaultReason,
}: {
  defaultSessionAt?: string;
  defaultLocation?: string;
  defaultFeelings?: string;
  defaultAmount?: string;
  defaultReason?: string;
}) {
  const [sessionAt, setSessionAt] = useState(defaultSessionAt ?? "");
  const [location, setLocation] = useState(defaultLocation ?? "");
  const [feelings, setFeelings] = useState(defaultFeelings ?? "");
  const [amount, setAmount] = useState(defaultAmount ?? "");
  const [reason, setReason] = useState(defaultReason ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function submit() {
    setError(null);
    startTransition(async () => {
      try {
        await recordFinalCannabisSession({ sessionAt, location, feelings, amount, reason });
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not save the final session.");
      }
    });
  }

  return (
    <div className="grid gap-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="final-session-at">Local date and time</Label>
          <Input id="final-session-at" type="datetime-local" value={sessionAt} onChange={(event) => setSessionAt(event.target.value)} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="final-session-location">Location</Label>
          <Input id="final-session-location" value={location} onChange={(event) => setLocation(event.target.value)} placeholder="Amsterdam" />
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="final-session-feelings">Feelings</Label>
        <Textarea id="final-session-feelings" rows={2} value={feelings} onChange={(event) => setFeelings(event.target.value)} />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="final-session-amount">Approximate amount consumed</Label>
        <Input id="final-session-amount" value={amount} onChange={(event) => setAmount(event.target.value)} />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="final-session-reason">Why this is the final session</Label>
        <Textarea id="final-session-reason" rows={2} value={reason} onChange={(event) => setReason(event.target.value)} />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button className="w-full gap-2 sm:w-fit" onClick={submit} disabled={isPending}>
        <CheckCircle2 className="h-4 w-4" />
        {isPending ? "Saving..." : "Save final session"}
      </Button>
    </div>
  );
}
