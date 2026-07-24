"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { setTopThree } from "@/server/actions/tasks";
import type { TaskWithProject } from "@/server/data/tasks";

export function TopThreePicker({
  candidates,
  initialSelectedIds,
}: {
  candidates: TaskWithProject[];
  initialSelectedIds: string[];
}) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>(initialSelectedIds);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function toggle(id: string) {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 3) {
        toast.warning("You can only pick 3 priorities for today.");
        return prev;
      }
      return [...prev, id];
    });
  }

  function save() {
    startTransition(async () => {
      await setTopThree(selected);
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="ghost" size="icon" className="h-7 w-7" />}>
        <Pencil className="h-3.5 w-3.5" />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Set today&apos;s top 3 priorities</DialogTitle>
          <DialogDescription>Pick up to three tasks to focus on today.</DialogDescription>
        </DialogHeader>
        <div className="flex max-h-80 flex-col gap-1 overflow-y-auto">
          {candidates.length === 0 && (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No open tasks yet — create one from the Tasks page first.
            </p>
          )}
          {candidates.map((task) => (
            <label
              key={task.id}
              className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-2 hover:bg-muted"
            >
              <Checkbox checked={selected.includes(task.id)} onCheckedChange={() => toggle(task.id)} />
              <span className="text-sm">{task.title}</span>
            </label>
          ))}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={save} disabled={isPending}>
            {isPending ? "Saving…" : "Save priorities"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
