import type { EntryTypeConfig, RawFormValues } from "../lib/types";

type ReviewSectionProps = {
  title: string;
  description: string;
  fields: EntryTypeConfig["quickFields"] | EntryTypeConfig["detailedFields"];
  values: RawFormValues;
};

export function ReviewSection({
  title,
  description,
  fields,
  values,
}: ReviewSectionProps) {
  return (
    <section className="entry-card section-stack">
      <div className="section-header">
        <h2>{title}</h2>
        <p>{description}</p>
      </div>

      <div className="review-stack">
        {fields.map((field) => (
          <article key={field.name} className="review-item">
            <h3>{field.label}</h3>
            <p>{values[field.name] || "尚未填寫"}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

