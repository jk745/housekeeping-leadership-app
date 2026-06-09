import {
  entryTypeIds,
  type DraftResult,
  type EntryTypeId,
  type TransformEntryPayload,
} from "../../../src/lib/types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

export function parseTransformEntryPayload(value: unknown): TransformEntryPayload | null {
  if (!isRecord(value)) {
    return null;
  }

  const { entryType, mode, rawValues } = value;

  if (typeof entryType !== "string" || !entryTypeIds.includes(entryType as (typeof entryTypeIds)[number])) {
    return null;
  }

  if (mode !== "quick" && mode !== "detailed") {
    return null;
  }

  if (!isRecord(rawValues)) {
    return null;
  }

  const normalizedRawValues = Object.entries(rawValues).reduce<Record<string, string>>(
    (result, [key, rawValue]) => {
      if (typeof rawValue === "string") {
        result[key] = rawValue;
      }

      return result;
    },
    {},
  );

  return {
    entryType: entryType as EntryTypeId,
    mode,
    rawValues: normalizedRawValues,
  };
}

export const structuredDraftSchema = {
  type: "object",
  additionalProperties: false,
  required: ["title", "summary", "sections", "suggestedActions"],
  properties: {
    title: {
      type: "string",
    },
    summary: {
      type: "string",
    },
    sections: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["key", "title", "summary", "bullets"],
        properties: {
          key: {
            type: "string",
          },
          title: {
            type: "string",
          },
          summary: {
            type: "string",
          },
          bullets: {
            type: "array",
            items: {
              type: "string",
            },
          },
        },
      },
    },
    suggestedActions: {
      type: "array",
      items: {
        type: "string",
      },
    },
  },
} satisfies Record<string, unknown>;

export const structuredDraftFormat = {
  type: "json_schema",
  name: "housekeeping_transform_result",
  strict: true,
  schema: structuredDraftSchema,
} as const;

export type StructuredDraftResponse = DraftResult;

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isDraftSection(value: unknown): value is DraftResult["sections"][number] {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.key === "string" &&
    typeof value.title === "string" &&
    typeof value.summary === "string" &&
    isStringArray(value.bullets)
  );
}

export function parseStructuredDraftResponse(value: unknown): StructuredDraftResponse | null {
  if (!isRecord(value)) {
    return null;
  }

  if (
    typeof value.title !== "string" ||
    typeof value.summary !== "string" ||
    !Array.isArray(value.sections) ||
    !value.sections.every(isDraftSection) ||
    !isStringArray(value.suggestedActions)
  ) {
    return null;
  }

  const extraKeys = Object.keys(value).filter(
    (key) => !["title", "summary", "sections", "suggestedActions"].includes(key),
  );

  if (extraKeys.length > 0) {
    return null;
  }

  return {
    title: value.title,
    summary: value.summary,
    sections: value.sections.map((section) => ({
      key: section.key,
      title: section.title,
      summary: section.summary,
      bullets: [...section.bullets],
    })),
    suggestedActions: [...value.suggestedActions],
  };
}
