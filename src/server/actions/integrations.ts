"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { getValidAccessToken } from "@/lib/google/tokens";
import { listTaskLists, listTasks } from "@/lib/google/tasks-client";

const GOOGLE_TASKS_SOURCE = "google_tasks";

export async function disconnectGoogleAccount(connectionId: string) {
  const user = await requireUser();
  await db.googleAccountConnection.delete({ where: { id: connectionId, userId: user.id } });
  revalidatePath("/integrations");
}

export async function importGoogleTasks(connectionId: string) {
  const user = await requireUser();
  const connection = await db.googleAccountConnection.findUniqueOrThrow({
    where: { id: connectionId, userId: user.id },
  });
  const accessToken = await getValidAccessToken(connection);

  const lists = await listTaskLists(accessToken);
  let importedProjects = 0;
  let importedTasks = 0;

  for (const list of lists) {
    const project = await db.project.upsert({
      where: {
        userId_externalSource_externalId: {
          userId: user.id,
          externalSource: GOOGLE_TASKS_SOURCE,
          externalId: list.id,
        },
      },
      update: { title: list.title },
      create: {
        userId: user.id,
        title: list.title,
        area: "OTHER",
        externalSource: GOOGLE_TASKS_SOURCE,
        externalId: list.id,
      },
    });
    importedProjects += 1;

    const tasks = await listTasks(accessToken, list.id);

    const idMap = new Map<string, string>();
    const upserted = await Promise.all(
      tasks.map((t) =>
        db.task.upsert({
          where: {
            userId_externalSource_externalId: {
              userId: user.id,
              externalSource: GOOGLE_TASKS_SOURCE,
              externalId: t.id,
            },
          },
          update: {
            title: t.title || "(untitled)",
            notes: t.notes ?? null,
            status: t.status === "completed" ? "DONE" : "TODO",
            completedAt: t.completed ? new Date(t.completed) : null,
            dueDate: t.due ? new Date(t.due) : null,
            projectId: project.id,
          },
          create: {
            userId: user.id,
            projectId: project.id,
            title: t.title || "(untitled)",
            notes: t.notes ?? null,
            status: t.status === "completed" ? "DONE" : "TODO",
            completedAt: t.completed ? new Date(t.completed) : null,
            dueDate: t.due ? new Date(t.due) : null,
            externalSource: GOOGLE_TASKS_SOURCE,
            externalId: t.id,
          },
        }),
      ),
    );
    tasks.forEach((t, i) => idMap.set(t.id, upserted[i].id));
    importedTasks += tasks.length;

    const withParents = tasks.filter((t) => t.parent);
    await Promise.all(
      withParents.map((t) => {
        const childId = idMap.get(t.id);
        const parentId = t.parent ? idMap.get(t.parent) : undefined;
        if (!childId || !parentId) return Promise.resolve();
        return db.task.update({ where: { id: childId }, data: { parentTaskId: parentId } });
      }),
    );
  }

  await db.googleAccountConnection.update({
    where: { id: connection.id },
    data: { lastImportedAt: new Date() },
  });

  revalidatePath("/integrations");
  revalidatePath("/tasks");
  revalidatePath("/projects");
  revalidatePath("/dashboard");

  return { importedProjects, importedTasks };
}
