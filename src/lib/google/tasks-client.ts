import "server-only";

export type GoogleTaskList = { id: string; title: string };

export type GoogleTask = {
  id: string;
  title: string;
  notes?: string;
  status: "needsAction" | "completed";
  due?: string;
  completed?: string;
  parent?: string;
  position: string;
};

async function googleFetch<T>(url: string, accessToken: string): Promise<T> {
  const res = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
  if (!res.ok) throw new Error(`Google Tasks API error (${res.status}): ${await res.text()}`);
  return res.json();
}

export async function listTaskLists(accessToken: string): Promise<GoogleTaskList[]> {
  const lists: GoogleTaskList[] = [];
  let pageToken: string | undefined;

  do {
    const url = new URL("https://tasks.googleapis.com/tasks/v1/users/@me/lists");
    url.searchParams.set("maxResults", "100");
    if (pageToken) url.searchParams.set("pageToken", pageToken);

    const data = await googleFetch<{ items?: GoogleTaskList[]; nextPageToken?: string }>(
      url.toString(),
      accessToken,
    );
    lists.push(...(data.items ?? []));
    pageToken = data.nextPageToken;
  } while (pageToken);

  return lists;
}

export async function listTasks(accessToken: string, taskListId: string): Promise<GoogleTask[]> {
  const tasks: GoogleTask[] = [];
  let pageToken: string | undefined;

  do {
    const url = new URL(
      `https://tasks.googleapis.com/tasks/v1/lists/${encodeURIComponent(taskListId)}/tasks`,
    );
    url.searchParams.set("showCompleted", "true");
    url.searchParams.set("showHidden", "true");
    url.searchParams.set("maxResults", "100");
    if (pageToken) url.searchParams.set("pageToken", pageToken);

    const data = await googleFetch<{ items?: GoogleTask[]; nextPageToken?: string }>(
      url.toString(),
      accessToken,
    );
    tasks.push(...(data.items ?? []));
    pageToken = data.nextPageToken;
  } while (pageToken);

  return tasks;
}
