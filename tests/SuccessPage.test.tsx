import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { useEffect, useState } from "react";
import { describe, expect, it } from "vitest";
import { AppRoutes } from "../src/app/router";
import { AppStateProvider, useAppState } from "../src/state/app-state";

function SuccessPageStateBootstrap({
  includeWriteResultUrl,
}: {
  includeWriteResultUrl: boolean;
}) {
  const { setDraftResult, setEntryType, setMode, setRawValues, setWriteResultUrl } = useAppState();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setEntryType("reading-note");
    setMode("quick");
    setRawValues({
      todayReading: "先理解，再帶領",
    });
    setDraftResult({
      title: "整理草稿",
      summary: "這是一筆已整理內容",
      sections: [],
      suggestedActions: [],
    });
    setWriteResultUrl(includeWriteResultUrl ? "https://www.notion.so/example" : null);
    setIsReady(true);
  }, [includeWriteResultUrl, setDraftResult, setEntryType, setMode, setRawValues, setWriteResultUrl]);

  return isReady ? <AppRoutes /> : null;
}

describe("SuccessPage", () => {
  it("redirects back to review when there is no successful Notion write result", async () => {
    render(
      <AppStateProvider>
        <MemoryRouter initialEntries={["/entry/reading-note/success"]}>
          <SuccessPageStateBootstrap includeWriteResultUrl={false} />
        </MemoryRouter>
      </AppStateProvider>,
    );

    expect(
      await screen.findByRole("heading", { name: "確認這次整理內容" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "讀書筆記 已寫入 Notion" })).not.toBeInTheDocument();
  });
});
