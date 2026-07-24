"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { updateProjectStatus, deleteProject } from "@/server/actions/projects";

export function ProjectActions({ projectId, status }: { projectId: string; status: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function setStatus(next: "ACTIVE" | "ON_HOLD" | "COMPLETED" | "ARCHIVED") {
    startTransition(async () => {
      await updateProjectStatus(projectId, next);
      router.refresh();
    });
  }

  return (
    <AlertDialog>
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="ghost" size="icon" disabled={isPending} />}>
          <MoreVertical className="h-4 w-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {status !== "ACTIVE" && <DropdownMenuItem onSelect={() => setStatus("ACTIVE")}>Mark active</DropdownMenuItem>}
          {status !== "ON_HOLD" && <DropdownMenuItem onSelect={() => setStatus("ON_HOLD")}>Put on hold</DropdownMenuItem>}
          {status !== "COMPLETED" && <DropdownMenuItem onSelect={() => setStatus("COMPLETED")}>Mark completed</DropdownMenuItem>}
          {status !== "ARCHIVED" && <DropdownMenuItem onSelect={() => setStatus("ARCHIVED")}>Archive</DropdownMenuItem>}
          <DropdownMenuSeparator />
          <AlertDialogTrigger
            render={<DropdownMenuItem variant="destructive" onSelect={(e) => e.preventDefault()} />}
          >
            Delete project
          </AlertDialogTrigger>
        </DropdownMenuContent>
      </DropdownMenu>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this project?</AlertDialogTitle>
          <AlertDialogDescription>
            This permanently deletes the project and its milestones. Tasks will be kept but unlinked from the project.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={() => deleteProject(projectId)}>Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
