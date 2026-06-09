import type { EntryTypeId } from "./types";

export type NotionDatabaseTarget = {
  entryType: EntryTypeId;
  kind: "database";
  targetId: string;
};

export type NotionPageTarget = {
  entryType: EntryTypeId;
  kind: "page";
  envKeys: [string, ...string[]];
};

export type NotionTarget = NotionDatabaseTarget | NotionPageTarget;

const notionTargetMap: Record<EntryTypeId, NotionTarget> = {
  "reading-note": {
    entryType: "reading-note",
    kind: "database",
    targetId: "68929af5-283b-41cc-b69e-f0c0a72100bd",
  },
  "field-observation": {
    entryType: "field-observation",
    kind: "database",
    targetId: "45b288dd-80ee-4f23-865c-4c3b394fabfe",
  },
  "team-interaction": {
    entryType: "team-interaction",
    kind: "database",
    targetId: "5684a663-c99a-4f82-afab-b1362859f53b",
  },
  "improvement-idea": {
    entryType: "improvement-idea",
    kind: "database",
    targetId: "fe0e1586-65dc-4afe-9128-8b1a37664d44",
  },
  "manager-update": {
    entryType: "manager-update",
    kind: "page",
    envKeys: ["NOTION_MANAGER_REPORT_PAGE_ID"],
  },
  "weekly-review": {
    entryType: "weekly-review",
    kind: "page",
    envKeys: ["NOTION_WEEKLY_REVIEW_PAGE_ID", "NOTION_MANAGER_REPORT_PAGE_ID"],
  },
};

export function getNotionTarget(entryType: EntryTypeId): NotionTarget {
  return notionTargetMap[entryType];
}

export function resolveNotionPageTargetId(
  target: NotionPageTarget,
  env: Record<string, string | undefined>,
): string | null {
  for (const envKey of target.envKeys) {
    const value = env[envKey]?.trim();

    if (value) {
      return value;
    }
  }

  return null;
}
