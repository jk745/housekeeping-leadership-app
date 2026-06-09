export const entryTypeIds = [
  "reading-note",
  "field-observation",
  "team-interaction",
  "improvement-idea",
  "manager-update",
  "weekly-review",
] as const;

export type EntryTypeId = (typeof entryTypeIds)[number];

export type EntryMode = "quick" | "detailed";

export type SelectOption = {
  label: string;
  value: string;
};

type BaseFieldConfig = {
  name: string;
  label: string;
  placeholder: string;
};

export type TextareaFieldConfig = BaseFieldConfig & {
  input: "textarea";
};

export type SelectFieldConfig = BaseFieldConfig & {
  input: "select";
  options: [SelectOption, ...SelectOption[]];
};

export type FieldConfig = TextareaFieldConfig | SelectFieldConfig;

export type EntryTypeConfig = {
  id: EntryTypeId;
  label: string;
  description: string;
  hint: string;
  quickFields: FieldConfig[];
  detailedFields: FieldConfig[];
};

export type RawFormValues = Record<string, string>;

export type DraftSection = {
  key: string;
  title: string;
  summary: string;
  bullets: string[];
};

export type DraftResult = {
  title: string;
  summary: string;
  sections: DraftSection[];
  suggestedActions: string[];
};

export type TransformEntryPayload = {
  entryType: EntryTypeId;
  mode: EntryMode;
  rawValues: RawFormValues;
};

export type WriteToNotionPayload = TransformEntryPayload & {
  draftResult: DraftResult;
};

export type WriteToNotionResult = {
  url: string;
};

export type AppFlowState = {
  entryType: EntryTypeId | null;
  mode: EntryMode;
  rawValues: RawFormValues;
  draftResult: DraftResult | null;
  writeResultUrl: string | null;
};
