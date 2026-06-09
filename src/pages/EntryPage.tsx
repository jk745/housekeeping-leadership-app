import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { DetailedEntryForm } from "../components/DetailedEntryForm";
import { EntryTypeCard } from "../components/EntryTypeCard";
import { ModeToggle } from "../components/ModeToggle";
import { QuickEntryForm } from "../components/QuickEntryForm";
import { StickyActionBar } from "../components/StickyActionBar";
import { getEntryTypeConfig } from "../lib/entry-types";
import {
  buildInitialFormValues,
  getFieldsForEntryMode,
} from "../utils/form-builders";
import { clearEntryDraft, readEntryDraft, saveEntryDraft } from "../utils/storage";
import { useAppState } from "../state/app-state";
import { entryTypeIds, type EntryMode, type EntryTypeId, type RawFormValues } from "../lib/types";

function isEntryTypeId(value: string | undefined): value is EntryTypeId {
  return Boolean(value && entryTypeIds.includes(value as EntryTypeId));
}

function getInitialValues(entryType: EntryTypeId, mode: EntryMode): RawFormValues {
  const draft = readEntryDraft(entryType);
  return draft[mode];
}

type EntryPageState = {
  mode: EntryMode;
  valuesByMode: Record<EntryMode, RawFormValues>;
};

function buildPageState(entryType: EntryTypeId): EntryPageState {
  const draft = readEntryDraft(entryType);

  return {
    mode: draft.lastMode,
    valuesByMode: {
      quick: draft.quick,
      detailed: draft.detailed,
    },
  };
}

function hasAnyValue(values: RawFormValues) {
  return Object.values(values).some((value) => value.trim() !== "");
}

export function EntryPage() {
  const { entrySlug } = useParams();
  const navigate = useNavigate();
  const { setDraftResult, setEntryType, setMode, setRawValues, setWriteResultUrl } =
    useAppState();

  if (!isEntryTypeId(entrySlug)) {
    return <Navigate to="/" replace />;
  }

  const entryType = entrySlug;
  const config = getEntryTypeConfig(entryType);
  const [pageState, setPageState] = useState<EntryPageState>(() => buildPageState(entryType));
  const mode = pageState.mode;
  const values = pageState.valuesByMode[mode];

  const fields = useMemo(
    () => getFieldsForEntryMode(entryType, mode),
    [entryType, mode],
  );

  useEffect(() => {
    setPageState(buildPageState(entryType));
  }, [entryType]);

  useEffect(() => {
    const hasQuickDraft = hasAnyValue(pageState.valuesByMode.quick);
    const hasDetailedDraft = hasAnyValue(pageState.valuesByMode.detailed);

    if (!hasQuickDraft && !hasDetailedDraft) {
      clearEntryDraft(entryType);
      return;
    }

    saveEntryDraft(entryType, mode, values);
  }, [entryType, mode, pageState.valuesByMode.detailed, pageState.valuesByMode.quick, values]);

  const handleModeChange = (nextMode: EntryMode) => {
    if (nextMode === mode) {
      return;
    }

    setPageState((current) => ({
      ...current,
      mode: nextMode,
      valuesByMode: {
        ...current.valuesByMode,
        [nextMode]:
          current.valuesByMode[nextMode] ?? getInitialValues(entryType, nextMode),
      },
    }));
  };

  const handleFieldChange = (name: string, value: string) => {
    setPageState((current) => ({
      ...current,
      valuesByMode: {
        ...current.valuesByMode,
        [current.mode]: {
          ...current.valuesByMode[current.mode],
          [name]: value,
        },
      },
    }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setEntryType(entryType);
    setMode(mode);
    setRawValues(values);
    setDraftResult(null);
    setWriteResultUrl(null);
    navigate(`/entry/${entryType}/review`);
  };

  const handleReset = () => {
    clearEntryDraft(entryType);
    setPageState({
      mode,
      valuesByMode: {
        quick: buildInitialFormValues(entryType, "quick"),
        detailed: buildInitialFormValues(entryType, "detailed"),
      },
    });
  };

  return (
    <main className="app-shell">
      <EntryTypeCard config={config} />
      <ModeToggle mode={mode} onChange={handleModeChange} />

      <form onSubmit={handleSubmit}>
        {mode === "quick" ? (
          <QuickEntryForm fields={fields} values={values} onChange={handleFieldChange} />
        ) : (
          <DetailedEntryForm fields={fields} values={values} onChange={handleFieldChange} />
        )}

        <StickyActionBar>
          <button type="button" className="secondary-action" onClick={handleReset}>
            清除這次草稿
          </button>
          <button type="submit" className="primary-action">
            前往檢查整理內容
          </button>
        </StickyActionBar>
      </form>

      <Link to="/" className="entry-card entry-card-inline section-stack">
        回到首頁
      </Link>
    </main>
  );
}
