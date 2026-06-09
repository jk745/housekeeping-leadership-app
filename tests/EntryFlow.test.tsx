import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import { AppRoutes } from "../src/app/router";
import { AppStateProvider } from "../src/state/app-state";
import { readEntryDraft } from "../src/utils/storage";

describe("EntryFlow", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.stubGlobal(
      "fetch",
      vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(_input);
        const payload = JSON.parse(String(init?.body ?? "{}")) as {
          entryType?: string;
          draftResult?: {
            title?: string;
          };
          rawValues?: Record<string, string>;
        };
        const values = Object.values(payload.rawValues ?? {}).filter(
          (value) => value.trim() !== "",
        );

        if (url.includes("write-to-notion")) {
          return {
            ok: true,
            json: async () => ({
              ok: true,
              url: "https://www.notion.so/reading-note-1",
            }),
          } satisfies Pick<Response, "ok" | "json">;
        }

        return {
          ok: true,
          json: async () => ({
            ok: true,
            draft: {
              title: "整理草稿",
              summary: `${payload.entryType ?? "entry"} 已整理完成`,
              sections: [
                {
                  key: "focus",
                  title: "這次重點",
                  summary: values[0] ?? "尚未提供摘要。",
                  bullets: values.slice(1),
                },
              ],
              suggestedActions: ["先理解，再帶領"],
            },
          }),
        } satisfies Pick<Response, "ok" | "json">;
      }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("supports home to entry, mode toggle, and submit to review", async () => {
    const user = userEvent.setup();

    render(
      <AppStateProvider>
        <MemoryRouter initialEntries={["/"]}>
          <AppRoutes />
        </MemoryRouter>
      </AppStateProvider>,
    );

    await user.click(screen.getByRole("link", { name: "讀書筆記" }));

    expect(
      screen.getByRole("heading", { name: "讀書筆記" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "快速整理" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByLabelText("今天讀到什麼")).toBeInTheDocument();
    expect(screen.queryByLabelText("書中觀念")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "完整整理" }));

    expect(screen.getByLabelText("書中觀念")).toBeInTheDocument();
    expect(screen.queryByLabelText("今天讀到什麼")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "快速整理" }));
    await user.type(
      screen.getByLabelText("今天讀到什麼"),
      "先理解，再帶領",
    );
    await user.type(
      screen.getByLabelText("這段讓我想到什麼"),
      "上任初期先跟房與觀察查房節奏",
    );
    await user.click(screen.getByRole("button", { name: "前往檢查整理內容" }));

    expect(
      screen.getByRole("heading", { name: "確認這次整理內容" }),
    ).toBeInTheDocument();
    expect(await screen.findByRole("heading", { name: "整理草稿" })).toBeInTheDocument();
    expect(screen.getByText("reading-note 已整理完成")).toBeInTheDocument();
    expect(screen.getByText("這次重點")).toBeInTheDocument();
    expect(screen.getAllByText("先理解，再帶領")).toHaveLength(3);
    expect(screen.getAllByText("上任初期先跟房與觀察查房節奏")).toHaveLength(2);
  });

  it("persists drafts locally and clears them after success", async () => {
    const user = userEvent.setup();

    render(
      <AppStateProvider>
        <MemoryRouter initialEntries={["/entry/reading-note"]}>
          <AppRoutes />
        </MemoryRouter>
      </AppStateProvider>,
    );

    await user.type(
      screen.getByLabelText("今天讀到什麼"),
      "先理解客房現場語言",
    );
    await user.type(
      screen.getByLabelText("這段讓我想到什麼"),
      "入住尖峰前要先對齊房況回報節點",
    );

    expect(readEntryDraft("reading-note").quick.todayReading).toBe(
      "先理解客房現場語言",
    );

    await user.click(screen.getByRole("button", { name: "前往檢查整理內容" }));
    await screen.findByRole("heading", { name: "整理草稿" });
    await user.click(screen.getByRole("button", { name: "確認寫入 Notion" }));

    expect(
      screen.getByRole("heading", { name: "讀書筆記 已寫入 Notion" }),
    ).toBeInTheDocument();
    expect(screen.getByText("這次內容已經寫進對應的 Notion 位置。")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "開啟 Notion 查看這筆內容" }),
    ).toHaveAttribute("href", "https://www.notion.so/reading-note-1");

    await user.click(screen.getByRole("link", { name: "回到首頁" }));

    expect(
      window.localStorage.getItem("housekeeping-leadership:draft:reading-note"),
    ).toBeNull();
  });

  it("supports detailed mode draft, review, and success flow", async () => {
    const user = userEvent.setup();

    window.localStorage.setItem(
      "housekeeping-leadership:draft:reading-note",
      JSON.stringify({
        lastMode: "detailed",
        quick: {
          todayReading: "quick bucket should stay separate",
        },
        detailed: {
          bookConcept: "先從現場語言建立信任",
          transferRelevance: "先熟悉查房與房況回報",
          strayLegacyKey: "should not restore",
        },
      }),
    );

    render(
      <AppStateProvider>
        <MemoryRouter initialEntries={["/entry/reading-note"]}>
          <AppRoutes />
        </MemoryRouter>
      </AppStateProvider>,
    );

    expect(screen.getByRole("button", { name: "完整整理" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByLabelText("書中觀念")).toHaveValue(
      "先從現場語言建立信任",
    );
    expect(screen.getByLabelText("跟我轉任房務的關係")).toHaveValue(
      "先熟悉查房與房況回報",
    );
    expect(screen.queryByDisplayValue("should not restore")).not.toBeInTheDocument();

    await user.clear(screen.getByLabelText("書中觀念"));
    await user.type(
      screen.getByLabelText("書中觀念"),
      "先理解，再帶領",
    );
    await user.type(
      screen.getByLabelText("對我的提醒"),
      "不要急著改退房清潔節奏",
    );
    await user.type(
      screen.getByLabelText("我下週可以做的行動"),
      "跟房兩次並記錄查房交接句型",
    );

    const draft = readEntryDraft("reading-note");
    expect(draft.quick.todayReading).toBe("quick bucket should stay separate");
    expect(draft.detailed.bookConcept).toBe("先理解，再帶領");
    expect(draft.detailed.strayLegacyKey).toBeUndefined();

    await user.click(screen.getByRole("button", { name: "前往檢查整理內容" }));

    expect(
      screen.getByRole("heading", { name: "確認這次整理內容" }),
    ).toBeInTheDocument();
    expect(await screen.findByRole("heading", { name: "整理草稿" })).toBeInTheDocument();
    expect(screen.getAllByText("先理解，再帶領")).toHaveLength(3);
    expect(screen.getAllByText("不要急著改退房清潔節奏")).toHaveLength(2);
    expect(screen.getAllByText("跟房兩次並記錄查房交接句型")).toHaveLength(2);

    await user.click(screen.getByRole("button", { name: "確認寫入 Notion" }));

    expect(
      screen.getByRole("heading", { name: "讀書筆記 已寫入 Notion" }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("link", { name: "再整理一筆" }));

    expect(
      window.localStorage.getItem("housekeeping-leadership:draft:reading-note"),
    ).toBeNull();
  });

  it("stays on the review page when Notion write fails", async () => {
    const user = userEvent.setup();

    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input);
        const payload = JSON.parse(String(init?.body ?? "{}")) as {
          entryType?: string;
          rawValues?: Record<string, string>;
        };
        const values = Object.values(payload.rawValues ?? {}).filter(
          (value) => value.trim() !== "",
        );

        if (url.includes("write-to-notion")) {
          return {
            ok: false,
            json: async () => ({
              ok: false,
              error: "寫入 Notion 失敗，請稍後再試。",
            }),
          } satisfies Pick<Response, "ok" | "json">;
        }

        return {
          ok: true,
          json: async () => ({
            ok: true,
            draft: {
              title: "整理草稿",
              summary: `${payload.entryType ?? "entry"} 已整理完成`,
              sections: [
                {
                  key: "focus",
                  title: "這次重點",
                  summary: values[0] ?? "尚未提供摘要。",
                  bullets: values.slice(1),
                },
              ],
              suggestedActions: ["先理解，再帶領"],
            },
          }),
        } satisfies Pick<Response, "ok" | "json">;
      }),
    );

    render(
      <AppStateProvider>
        <MemoryRouter initialEntries={["/entry/reading-note"]}>
          <AppRoutes />
        </MemoryRouter>
      </AppStateProvider>,
    );

    await user.type(screen.getByLabelText("今天讀到什麼"), "先理解，再帶領");
    await user.click(screen.getByRole("button", { name: "前往檢查整理內容" }));
    await screen.findByRole("heading", { name: "整理草稿" });
    await user.click(screen.getByRole("button", { name: "確認寫入 Notion" }));

    expect(
      await screen.findByText("寫入 Notion 失敗，請稍後再試。"),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "讀書筆記 已寫入 Notion" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "確認這次整理內容" }),
    ).toBeInTheDocument();
  });
});
