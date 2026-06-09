import type { EntryTypeConfig } from "../lib/types";

type EntryTypeCardProps = {
  config: EntryTypeConfig;
};

export function EntryTypeCard({ config }: EntryTypeCardProps) {
  return (
    <section className="hero-card">
      <p className="eyebrow">{config.label}</p>
      <h1>{config.label}</h1>
      <p className="hero-copy">{config.description}</p>
      <p className="hero-copy">{config.hint}</p>
    </section>
  );
}

