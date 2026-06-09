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
    kind: "page",
    envKeys: ["NOTION_READING_NOTE_PAGE_ID", "NOTION_MANAGER_REPORT_PAGE_ID"],
  },
  "field-observation": {
    entryType: "field-observation",
    kind: "page",
    envKeys: ["NOTION_FIELD_OBSERVATION_PAGE_ID", "NOTION_MANAGER_REPORT_PAGE_ID"],
  },
  "team-interaction": {
    entryType: "team-interaction",
    kind: "page",
    envKeys: ["NOTION_TEAM_INTERACTION_PAGE_ID", "NOTION_MANAGER_REPORT_PAGE_ID"],
  },
  "improvement-idea": {
    entryType: "improvement-idea",
    kind: "page",
    envKeys: ["NOTION_IMPROVEMENT_IDEA_PAGE_ID", "NOTION_MANAGER_REPORT_PAGE_ID"],
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
