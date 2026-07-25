"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { INTERACTION_TYPE_LABEL, INTERACTION_TYPE_OPTIONS } from "@/lib/contact-format";
import { logInteraction } from "@/server/actions/contacts";

export function LogInteractionForm({ contactId }: { contactId: string }) {
  const [type, setType] = useState("NOTE");
  const [summary, setSummary] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!summary.trim()) return;
    startTransition(async () => {
      await logInteraction({ contactId, type: type as never, summary });
      setSummary("");
      router.refresh();
    });
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <Select value={type} onValueChange={(value) => value && setType(value)}>
          <SelectTrigger className="w-32">
            <SelectValue>{(value: string) => INTERACTION_TYPE_LABEL[value] ?? value}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {INTERACTION_TYPE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Textarea
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder="What happened?"
          rows={1}
          className="min-h-9 flex-1"
        />
        <Button type="submit" size="sm" disabled={isPending || !summary.trim()}>
          Log
        </Button>
      </div>
    </form>
  );
}
