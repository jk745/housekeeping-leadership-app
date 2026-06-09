import { getEntryTypeConfig } from "../lib/entry-types";
import type { EntryMode, EntryTypeId, FieldConfig, RawFormValues } from "../lib/types";

export function getFieldsForEntryMode(
  entryType: EntryTypeId,
  mode: EntryMode,
): FieldConfig[] {
  const config = getEntryTypeConfig(entryType);

  return mode === "quick" ? config.quickFields : config.detailedFields;
}

export function createEmptyFormValues(fields: FieldConfig[]): RawFormValues {
  return fields.reduce<RawFormValues>((values, field) => {
    values[field.name] = "";
    return values;
  }, {});
}

export function buildInitialFormValues(
  entryType: EntryTypeId,
  mode: EntryMode,
): RawFormValues {
  return createEmptyFormValues(getFieldsForEntryMode(entryType, mode));
}
