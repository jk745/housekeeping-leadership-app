import type { EntryTypeId } from "./types";

export type NotionDatabaseTarget = {
  entryType: EntryTypeId;
  kind: "database";
  targetId?: string;
  envKey?: string;
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
    envKey: "NOTION_READING_NOTE_PAGE_ID",
  },
  "field-observation": {
    entryType: "field-observation",
    kind: "database",
    targetId: "5eb2e0b4a4fd40d382405b8dd9b15729",
  },
  "team-interaction": {
    entryType: "team-interaction",
    kind: "database",
    targetId: "d547fa8d7d2c4e9d98cf47fc178b7a5d",
  },
  "improvement-idea": {
    entryType: "improvement-idea",
    kind: "database",
    targetId: "ec59b785698b48c49669726bd4f9d127",
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
