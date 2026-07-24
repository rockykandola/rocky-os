"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { format } from "date-fns";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { createNote, deleteNote } from "@/server/actions/notes";
import type { Note } from "@/generated/prisma/client";

export function ProjectNotes({ projectId, notes }: { projectId: string; notes: Note[] }) {
  const [body, setBody] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    startTransition(async () => {
      await createNote({
        entityType: "PROJECT",
        entityId: projectId,
        title: null,
        body,
        revalidate: `/projects/${projectId}`,
      });
      setBody("");
      router.refresh();
    });
  }

  function remove(id: string) {
    startTransition(async () => {
      await deleteNote(id, `/projects/${projectId}`);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={submit} className="flex flex-col gap-2">
        <Textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Jot down a note for this project…"
          rows={3}
        />
        <Button type="submit" size="sm" className="self-end" disabled={isPending || !body.trim()}>
          Add note
        </Button>
      </form>
      <div className="flex flex-col gap-3">
        {notes.length === 0 && <p className="text-sm text-muted-foreground">No notes yet.</p>}
        {notes.map((note) => (
          <div key={note.id} className="flex items-start justify-between gap-2 rounded-lg border p-3">
            <div>
              <p className="whitespace-pre-wrap text-sm">{note.body}</p>
              <p className="mt-1 text-xs text-muted-foreground">{format(new Date(note.createdAt), "MMM d, yyyy · h:mm a")}</p>
            </div>
            <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 text-muted-foreground" onClick={() => remove(note.id)}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
