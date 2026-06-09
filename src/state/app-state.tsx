import {
  useCallback,
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type {
  AppFlowState,
  DraftResult,
  EntryMode,
  EntryTypeId,
  RawFormValues,
} from "../lib/types";

type AppStateContextValue = {
  state: AppFlowState;
  setEntryType: (entryType: EntryTypeId | null) => void;
  setMode: (mode: EntryMode) => void;
  setRawValues: (values: RawFormValues) => void;
  setDraftResult: (draftResult: DraftResult | null) => void;
  setWriteResultUrl: (url: string | null) => void;
  resetFlow: () => void;
};

const defaultState: AppFlowState = {
  entryType: null,
  mode: "quick",
  rawValues: {},
  draftResult: null,
  writeResultUrl: null,
};

const AppStateContext = createContext<AppStateContextValue | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppFlowState>(defaultState);
  const setEntryType = useCallback((entryType: EntryTypeId | null) => {
    setState((current) => ({
      ...current,
      entryType,
    }));
  }, []);
  const setMode = useCallback((mode: EntryMode) => {
    setState((current) => ({
      ...current,
      mode,
    }));
  }, []);
  const setRawValues = useCallback((rawValues: RawFormValues) => {
    setState((current) => ({
      ...current,
      rawValues,
    }));
  }, []);
  const setDraftResult = useCallback((draftResult: DraftResult | null) => {
    setState((current) => ({
      ...current,
      draftResult,
    }));
  }, []);
  const setWriteResultUrl = useCallback((writeResultUrl: string | null) => {
    setState((current) => ({
      ...current,
      writeResultUrl,
    }));
  }, []);
  const resetFlow = useCallback(() => {
    setState(defaultState);
  }, []);

  const value = useMemo<AppStateContextValue>(
    () => ({
      state,
      setEntryType,
      setMode,
      setRawValues,
      setDraftResult,
      setWriteResultUrl,
      resetFlow,
    }),
    [resetFlow, setDraftResult, setEntryType, setMode, setRawValues, setWriteResultUrl, state],
  );

  return (
    <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>
  );
}

export function useAppState(): AppStateContextValue {
  const context = useContext(AppStateContext);

  if (!context) {
    throw new Error("useAppState must be used inside AppStateProvider");
  }

  return context;
}
