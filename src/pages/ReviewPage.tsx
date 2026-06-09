import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { ReviewSection } from "../components/ReviewSection";
import { StickyActionBar } from "../components/StickyActionBar";
import { SuggestedActions } from "../components/SuggestedActions";
import { getEntryTypeConfig } from "../lib/entry-types";
import { getFieldsForEntryMode } from "../utils/form-builders";
import { useAppState } from "../state/app-state";
import { entryTypeIds, type EntryTypeId } from "../lib/types";
import { transformEntry, writeToNotion } from "../services/api";

function isEntryTypeId(value: string | undefined): value is EntryTypeId {
  return Boolean(value && entryTypeIds.includes(value as EntryTypeId));
}

export function ReviewPage() {
  const { entrySlug } = useParams();
  const navigate = useNavigate();
  const { state, setDraftResult, setWriteResultUrl } = useAppState();
  const hasRawValues = Object.values(state.rawValues).some((value) => value.trim() !== "");
  const [isLoading, setIsLoading] = useState(hasRawValues);
  const [isWriting, setIsWriting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isEntryTypeId(entrySlug)) {
    return <Navigate to="/" replace />;
  }

  if (state.entryType !== entrySlug) {
    return <Navigate to={`/entry/${entrySlug}`} replace />;
  }

  const config = getEntryTypeConfig(entrySlug);
  const fields = getFieldsForEntryMode(entrySlug, state.mode);

  useEffect(() => {
    if (!hasRawValues) {
      setErrorMessage("目前沒有可整理的內容，請先回到上一頁填寫資料。");
      setIsLoading(false);
      setDraftResult(null);
      return;
    }

    let cancelled = false;

    setIsLoading(true);
    setErrorMessage(null);
    setDraftResult(null);

    transformEntry({
      entryType: entrySlug,
      mode: state.mode,
      rawValues: state.rawValues,
    })
      .then((draftResult) => {
        if (cancelled) {
          return;
        }

        setDraftResult(draftResult);
      })
      .catch((error: unknown) => {
        if (cancelled) {
          return;
        }

        setDraftResult(null);
        setErrorMessage(
          error instanceof Error ? error.message : "目前無法完成整理，請稍後再試。",
        );
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [entrySlug, hasRawValues, setDraftResult, state.mode, state.rawValues]);

  const handleConfirm = async () => {
    if (!state.draftResult || isWriting) {
      return;
    }

    setIsWriting(true);
    setErrorMessage(null);
    setWriteResultUrl(null);

    try {
      const result = await writeToNotion({
        entryType: entrySlug,
        mode: state.mode,
        rawValues: state.rawValues,
        draftResult: state.draftResult,
      });

      setWriteResultUrl(result.url);
      navigate(`/entry/${entrySlug}/success`);
    } catch (error: unknown) {
      setErrorMessage(
        error instanceof Error ? error.message : "寫入 Notion 失敗，請稍後再試。",
      );
    } finally {
      setIsWriting(false);
    }
  };

  return (
    <main className="app-shell">
      <section className="hero-card">
        <p className="eyebrow">整理確認</p>
        <h1>確認這次整理內容</h1>
        <p className="hero-copy">
          先確認原始輸入，再看這次 API 整理出的重點與下一步，確認是否貼近你的現場判斷。
        </p>
      </section>

      <ReviewSection
        title="原始輸入內容"
        description="以下先直接呈現目前欄位內容，確認和這次房務／客務現場情境一致後，再決定是否送進 Notion。"
        fields={fields}
        values={state.rawValues}
      />

      {isLoading ? (
        <section className="entry-card section-stack">
          <div className="section-header">
            <h2>整理結果預覽</h2>
            <p>正在整理這次輸入，會把重點、判斷與下一步先收斂成 review 草稿。</p>
          </div>
        </section>
      ) : null}

      {!isLoading && errorMessage ? (
        <section className="entry-card section-stack">
          <div className="section-header">
            <h2>整理結果預覽</h2>
            <p>{errorMessage}</p>
          </div>
        </section>
      ) : null}

      {!isLoading && !errorMessage && state.draftResult ? (
        <section className="entry-card section-stack">
          <div className="section-header">
            <h2>{state.draftResult.title}</h2>
            <p>{state.draftResult.summary}</p>
          </div>

          <div className="review-stack">
            {state.draftResult.sections.map((section) => (
              <article key={section.key} className="review-item">
                <h3>{section.title}</h3>
                <p>{section.summary}</p>
                {section.bullets.length > 0 ? (
                  <ul className="suggestion-list">
                    {section.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                ) : null}
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <SuggestedActions
        entryType={entrySlug}
        actions={isLoading ? [] : state.draftResult?.suggestedActions}
      />

      <StickyActionBar>
        <Link to={`/entry/${entrySlug}`} className="secondary-action">
          返回調整內容
        </Link>
        <button
          type="button"
          className="primary-action"
          onClick={handleConfirm}
          disabled={isLoading || isWriting || !state.draftResult}
        >
          {isWriting ? "寫入 Notion 中..." : "確認寫入 Notion"}
        </button>
      </StickyActionBar>
    </main>
  );
}
