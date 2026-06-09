import { buildInitialFormValues, getFieldsForEntryMode } from "./form-builders";
import type { EntryMode, EntryTypeId, RawFormValues } from "../lib/types";

type EntryDraft = {
  lastMode: EntryMode;
  quick: RawFormValues;
  detailed: RawFormValues;
};

const STORAGE_PREFIX = "housekeeping-leadership:draft:";

function getDraftKey(entryType: EntryTypeId) {
  return `${STORAGE_PREFIX}${entryType}`;
}

function isStorageAvailable() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function createEmptyDraft(): EntryDraft {
  return {
    lastMode: "quick",
    quick: {},
    detailed: {},
  };
}

function sanitizeDraftValues(
  entryType: EntryTypeId,
  mode: EntryMode,
  values: unknown,
): RawFormValues {
  const allowedFieldNames = new Set(
    getFieldsForEntryMode(entryType, mode).map((field) => field.name),
  );
  const sanitizedValues = buildInitialFormValues(entryType, mode);

  if (!values || typeof values !== "object") {
    return sanitizedValues;
  }

  for (const [key, value] of Object.entries(values)) {
    if (allowedFieldNames.has(key) && typeof value === "string") {
      sanitizedValues[key] = value;
    }
  }

  return sanitizedValues;
}

export function readEntryDraft(entryType: EntryTypeId): EntryDraft {
  if (!isStorageAvailable()) {
    return createEmptyDraft();
  }

  const raw = window.localStorage.getItem(getDraftKey(entryType));

  if (!raw) {
    return createEmptyDraft();
  }

  try {
    const parsed = JSON.parse(raw) as Partial<EntryDraft>;

    return {
      lastMode: parsed.lastMode === "detailed" ? "detailed" : "quick",
      quick: sanitizeDraftValues(entryType, "quick", parsed.quick),
      detailed: sanitizeDraftValues(entryType, "detailed", parsed.detailed),
    };
  } catch {
    return createEmptyDraft();
  }
}

export function saveEntryDraft(
  entryType: EntryTypeId,
  mode: EntryMode,
  values: RawFormValues,
) {
  if (!isStorageAvailable()) {
    return;
  }

  const currentDraft = readEntryDraft(entryType);
  const nextDraft: EntryDraft = {
    ...currentDraft,
    lastMode: mode,
    [mode]: sanitizeDraftValues(entryType, mode, values),
  };

  window.localStorage.setItem(getDraftKey(entryType), JSON.stringify(nextDraft));
}

export function clearEntryDraft(entryType: EntryTypeId) {
  if (!isStorageAvailable()) {
    return;
  }

  window.localStorage.removeItem(getDraftKey(entryType));
}
