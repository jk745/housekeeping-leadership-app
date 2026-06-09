import type { FieldConfig, RawFormValues } from "../lib/types";

type QuickEntryFormProps = {
  fields: FieldConfig[];
  values: RawFormValues;
  onChange: (name: string, value: string) => void;
};

function renderField(
  field: FieldConfig,
  value: string,
  onChange: (name: string, value: string) => void,
) {
  if (field.input === "select") {
    return (
      <select
        id={field.name}
        name={field.name}
        value={value}
        onChange={(event) => onChange(field.name, event.target.value)}
        className="entry-input"
      >
        <option value="">請選擇</option>
        {field.options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  }

  return (
    <textarea
      id={field.name}
      name={field.name}
      value={value}
      placeholder={field.placeholder}
      onChange={(event) => onChange(field.name, event.target.value)}
      className="entry-input entry-textarea"
      rows={4}
    />
  );
}

export function QuickEntryForm({
  fields,
  values,
  onChange,
}: QuickEntryFormProps) {
  return (
    <section className="entry-card section-stack">
      <div className="section-header">
        <h2>快速整理內容</h2>
        <p>先記下今天最關鍵的觀察與想法，避免手機中斷時內容散掉。</p>
      </div>

      <div className="form-stack">
        {fields.map((field) => (
          <label key={field.name} htmlFor={field.name} className="field-stack">
            <span className="field-label">{field.label}</span>
            {renderField(field, values[field.name] ?? "", onChange)}
          </label>
        ))}
      </div>
    </section>
  );
}

