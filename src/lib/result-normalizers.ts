import type { DraftResult, DraftSection } from "./types";

function toTrimmedString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function normalizeBullets(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => toTrimmedString(item))
    .filter((item) => item.length > 0);
}

function normalizeSection(value: unknown, index: number): DraftSection | null {
  if (!isRecord(value)) {
    return null;
  }

  const title = toTrimmedString(value.title);
  const summary = toTrimmedString(value.summary) || "尚未提供摘要。";
  const bullets = normalizeBullets(value.bullets);

  if (!title) {
    return null;
  }

  return {
    key: toTrimmedString(value.key) || `section-${index + 1}`,
    title,
    summary,
    bullets,
  };
}

export function normalizeDraftResult(value: unknown): DraftResult {
  const record = isRecord(value) ? value : {};
  const sections = Array.isArray(record.sections)
    ? record.sections
        .map((section, index) => normalizeSection(section, index))
        .filter((section): section is DraftSection => section !== null)
    : [];

  return {
    title: toTrimmedString(record.title) || "整理草稿",
    summary:
      toTrimmedString(record.summary) || "已完成初步整理，請先確認內容是否貼近現場。",
    sections,
    suggestedActions: normalizeBullets(record.suggestedActions),
  };
}
