import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { useEffect, useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AppRoutes } from "../src/app/router";
import { AppStateProvider, useAppState } from "../src/state/app-state";

const { transformEntryMock } = vi.hoisted(() => ({
  transformEntryMock: vi.fn(),
}));

vi.mock("../src/services/api", () => ({
  transformEntry: transformEntryMock,
}));

function ReviewPageStateBootstrap() {
  const { setDraftResult, setEntryType, setMode, setRawValues } = useAppState();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setEntryType("reading-note");
    setMode("quick");
    setRawValues({
      todayReading: "新的輸入",
      triggeredThought: "新的想法",
    });
    setDraftResult({
      title: "上一輪整理",
      summary: "不該殘留到 loading",
      sections: [
        {
          key: "old",
          title: "舊重點",
          summary: "舊摘要",
          bullets: ["舊建議"],
        },
      ],
      suggestedActions: ["舊建議動作"],
    });
    setIsReady(true);
  }, [setDraftResult, setEntryType, setMode, setRawValues]);

  return isReady ? <AppRoutes /> : null;
}

describe("ReviewPage", () => {
  beforeEach(() => {
    transformEntryMock.mockImplementation(
      () =>
        new Promise(() => {
          return undefined;
        }),
    );
  });

  afterEach(() => {
    transformEntryMock.mockReset();
  });

  it("clears stale draft content while a new transform request is loading", async () => {
    render(
      <AppStateProvider>
        <MemoryRouter initialEntries={["/entry/reading-note/review"]}>
          <ReviewPageStateBootstrap />
        </MemoryRouter>
      </AppStateProvider>,
    );

    expect(
      await screen.findByText("正在整理這次輸入，會把重點、判斷與下一步先收斂成 review 草稿。"),
    ).toBeInTheDocument();
    expect(screen.queryByText("上一輪整理")).not.toBeInTheDocument();
    expect(screen.queryByText("舊建議動作")).not.toBeInTheDocument();
  });
});
