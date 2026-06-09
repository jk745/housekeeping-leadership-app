type NotionRequestOptions = {
  apiKey: string;
  path: string;
  body: Record<string, unknown>;
  notionVersion?: string;
};

type CreateDatabasePageOptions = {
  apiKey: string;
  parentId: string;
  properties: Record<string, unknown>;
  children?: unknown[];
};

type AppendBlockChildrenOptions = {
  apiKey: string;
  pageId: string;
  children: unknown[];
};

async function postToNotion({ apiKey, path, body, notionVersion, method }: NotionRequestOptions & { method?: string }) {
  const response = await fetch(`https://api.notion.com/v1${path}`, {
    method: method ?? "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "Notion-Version": notionVersion ?? "2022-06-28",
    },
    body: JSON.stringify(body),
  });

  const data = (await response.json().catch(() => null)) as Record<string, unknown> | null;

  if (!response.ok) {
    throw new Error(
      typeof data?.message === "string" ? data.message : "Notion request failed",
    );
  }

  return data;
}

export async function createDatabasePage(options: CreateDatabasePageOptions) {
  const response = await postToNotion({
    apiKey: options.apiKey,
    path: "/pages",
    body: {
      parent: {
        type: "database_id",
        database_id: options.parentId,
      },
      properties: options.properties,
      children: options.children ?? [],
    },
  });

  return {
    id: String(response?.id ?? ""),
    url: String(response?.url ?? ""),
  };
}

export async function appendBlockChildren(options: AppendBlockChildrenOptions) {
  await postToNotion({
    apiKey: options.apiKey,
    path: `/blocks/${options.pageId}/children`,
    method: "PATCH",
    body: {
      children: options.children,
    },
  });

  return {
    url: `https://www.notion.so/${options.pageId.split("-").join("")}`,
  };
}
