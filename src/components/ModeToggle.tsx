import type { EntryMode } from "../lib/types";

type ModeToggleProps = {
  mode: EntryMode;
  onChange: (mode: EntryMode) => void;
};

export function ModeToggle({ mode, onChange }: ModeToggleProps) {
  return (
    <section className="entry-card section-stack" aria-label="整理模式">
      <div className="section-header">
        <h2>整理模式</h2>
        <p>先用快速整理抓住重點，需要時再切換完整整理補上脈絡。</p>
      </div>

      <div className="segmented-toggle">
        <button
          type="button"
          className="toggle-button"
          aria-pressed={mode === "quick"}
          onClick={() => onChange("quick")}
        >
          快速整理
        </button>
        <button
          type="button"
          className="toggle-button"
          aria-pressed={mode === "detailed"}
          onClick={() => onChange("detailed")}
        >
          完整整理
        </button>
      </div>
    </section>
  );
}

