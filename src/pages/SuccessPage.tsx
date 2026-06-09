import { Link, Navigate, useParams } from "react-router-dom";
import { getEntryTypeConfig } from "../lib/entry-types";
import { clearEntryDraft } from "../utils/storage";
import { useAppState } from "../state/app-state";
import { entryTypeIds, type EntryTypeId } from "../lib/types";

function isEntryTypeId(value: string | undefined): value is EntryTypeId {
  return Boolean(value && entryTypeIds.includes(value as EntryTypeId));
}

export function SuccessPage() {
  const { entrySlug } = useParams();
  const { resetFlow, state } = useAppState();

  if (!isEntryTypeId(entrySlug)) {
    return <Navigate to="/" replace />;
  }

  const config = getEntryTypeConfig(entrySlug);

  if (!state.draftResult || !state.writeResultUrl) {
    return <Navigate to={`/entry/${entrySlug}/review`} replace />;
  }

  const handleFinish = () => {
    clearEntryDraft(entrySlug);
    resetFlow();
  };

  return (
    <main className="app-shell">
      <section className="hero-card">
        <p className="eyebrow">整理完成</p>
        <h1>{config.label} 已寫入 Notion</h1>
        <p className="hero-copy">這次內容已經寫進對應的 Notion 位置。</p>
        <p className="hero-copy">
          先理解，再帶領；先信任，再要求；先穩定，再改善。你已把這次觀察與判斷穩穩留下來。
        </p>
      </section>

      <section className="entry-card section-stack">
        <div className="section-header">
          <h2>目前完成的內容</h2>
          <p>{String(state.draftResult.summary ?? "")}</p>
        </div>
        <a
          href={state.writeResultUrl}
          className="primary-action"
          target="_blank"
          rel="noreferrer"
        >
          開啟 Notion 查看這筆內容
        </a>
      </section>

      <div className="sticky-action-bar">
        <Link to={`/entry/${entrySlug}`} className="secondary-action" onClick={handleFinish}>
          再整理一筆
        </Link>
        <Link to="/" className="primary-action" onClick={handleFinish}>
          回到首頁
        </Link>
      </div>
    </main>
  );
}
