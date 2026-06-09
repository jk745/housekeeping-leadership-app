import type { FieldConfig, RawFormValues } from "../lib/types";
import { QuickEntryForm } from "./QuickEntryForm";

type DetailedEntryFormProps = {
  fields: FieldConfig[];
  values: RawFormValues;
  onChange: (name: string, value: string) => void;
};

export function DetailedEntryForm(props: DetailedEntryFormProps) {
  return <QuickEntryForm {...props} />;
}

