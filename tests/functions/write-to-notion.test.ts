import { afterEach, describe, expect, it, vi } from "vitest";

const appendBlockChildrenMock = vi.fn();
const createDatabasePageMock = vi.fn();

vi.mock("../../netlify/functions/shared/notion-client", () => ({
  appendBlockChildren: appendBlockChildrenMock,
  createDatabasePage: createDatabasePageMock,
}));

describe("write-to-notion function", () => {
  const originalProcess = globalThis.process;

  afterEach(() => {
    appendBlockChildrenMock.mockReset();
    createDatabasePageMock.mockReset();
    vi.useRealTimers();
    vi.resetModules();
    globalThis.process = originalProcess;
  });

  it("creates a database page for reading notes", async () => {
    globalThis.process = {
      env: {
        NOTION_API_KEY: "test-key",
        NOTION_MANAGER_REPORT_PAGE_ID: "379490bb-a86d-81d0-89ed-dfce0cd0024f",
      },
    } as unknown as typeof process;

    createDatabasePageMock.mockResolvedValue({
      id: "page-1",
      url: "https://notion.so/page-1",
    });

    const { handler } = await import("../../netlify/functions/write-to-notion");

    const response = await handler({
      httpMethod: "POST",
      body: JSON.stringify({
        entryType: "reading-note",
        mode: "detailed",
        rawValues: {
          bookConcept: "先理解，再帶領",
          transferRelevance: "先理解查房節點再要求速度",
          leadershipReminder: "先觀察房況回報",
          nextWeekAction: "跟房兩次",
        },
        draftResult: {
          title: "讀書筆記整理",
          summary: "先把房務現場語言重新熟悉起來。",
          sections: [
            {
              key: "focus",
              title: "核心提醒",
              summary: "先理解，再帶領",
              bullets: ["先跟房", "先查房"],
            },
          ],
          suggestedActions: ["先跟房兩次"],
        },
      }),
    });

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toEqual({
      ok: true,
      url: "https://notion.so/page-1",
    });
    expect(createDatabasePageMock).toHaveBeenCalledWith({
      apiKey: "test-key",
      parentId: "68929af5-283b-41cc-b69e-f0c0a72100bd",
      properties: {
        "筆記標題": {
          title: [{ type: "text", text: { content: "讀書筆記整理" } }],
        },
        "章節": {
          rich_text: [{ type: "text", text: { content: "核心提醒" } }],
        },
        IPA: {
          select: { name: "行動 Action" },
        },
        "核心觀念": {
          rich_text: [{ type: "text", text: { content: "先理解，再帶領" } }],
        },
        "對我的提醒": {
          rich_text: [{ type: "text", text: { content: "先觀察房況回報" } }],
        },
        "可執行行動": {
          rich_text: [{ type: "text", text: { content: "跟房兩次" } }],
        },
        "重要程度": {
          select: { name: "中" },
        },
      },
      children: expect.any(Array),
    });
  });

  it("uses Asia/Taipei local date for field observations instead of UTC date", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-08T18:30:00.000Z"));

    globalThis.process = {
      env: {
        NOTION_API_KEY: "test-key",
      },
    } as unknown as typeof process;

    createDatabasePageMock.mockResolvedValue({
      id: "page-3",
      url: "https://notion.so/page-3",
    });

    const { handler } = await import("../../netlify/functions/write-to-notion");

    const response = await handler({
      httpMethod: "POST",
      body: JSON.stringify({
        entryType: "field-observation",
        mode: "detailed",
        rawValues: {
          scene: "房況回報",
          processSeen: "先查房再回報櫃檯",
          unknowns: "急房插單的優先順序",
          impactOnFrontDesk: "櫃檯難以即時回覆客人",
          improvementIdea: "先固定房況回報節點",
        },
        draftResult: {
          title: "房況回報觀察",
          summary: "先把急房回報節點穩住。",
          sections: [],
          suggestedActions: [],
        },
      }),
    });

    expect(response.statusCode).toBe(200);
    expect(createDatabasePageMock).toHaveBeenCalledWith(
      expect.objectContaining({
        properties: expect.objectContaining({
          日期: {
            date: {
              start: "2026-06-09",
            },
          },
        }),
      }),
    );
  });

  it("creates an improvement idea page with valid select, status, and multi-select properties", async () => {
    globalThis.process = {
      env: {
        NOTION_API_KEY: "test-key",
        NOTION_MANAGER_REPORT_PAGE_ID: "379490bb-a86d-81d0-89ed-dfce0cd0024f",
      },
    } as unknown as typeof process;

    createDatabasePageMock.mockResolvedValue({
      id: "page-2",
      url: "https://notion.so/page-2",
    });

    const { handler } = await import("../../netlify/functions/write-to-notion");

    const response = await handler({
      httpMethod: "POST",
      body: JSON.stringify({
        entryType: "improvement-idea",
        mode: "detailed",
        rawValues: {
          topic: "急房回報不夠即時",
          category: "跨部門溝通",
          currentSituation: "櫃檯常要追問房況",
          possibleCauses: "查房與回報節點不一致",
          affectedPeople: "客人、櫃檯、房務主管",
          severity: "高",
          frequency: "經常",
          initialIdea: "先固定急房回報句型",
        },
        draftResult: {
          title: "改善議題整理",
          summary: "先把急房回報節點穩住。",
          sections: [],
          suggestedActions: ["先對齊交接句型"],
        },
      }),
    });

    expect(response.statusCode).toBe(200);
    expect(createDatabasePageMock).toHaveBeenCalledWith({
      apiKey: "test-key",
      parentId: "fe0e1586-65dc-4afe-9128-8b1a37664d44",
      properties: {
        "議題名稱": {
          title: [{ type: "text", text: { content: "急房回報不夠即時" } }],
        },
        "類型": {
          select: { name: "跨部門溝通" },
        },
        "影響對象": {
          multi_select: expect.arrayContaining([
            { name: "客人" },
            { name: "櫃檯" },
            { name: "主管" },
          ]),
        },
        "嚴重度": {
          select: { name: "高" },
        },
        "發生頻率": {
          select: { name: "經常" },
        },
        "目前狀況": {
          rich_text: [{ type: "text", text: { content: "櫃檯常要追問房況" } }],
        },
        "可能原因": {
          rich_text: [{ type: "text", text: { content: "查房與回報節點不一致" } }],
        },
        "初步想法": {
          rich_text: [{ type: "text", text: { content: "先固定急房回報句型" } }],
        },
        "狀態": {
          status: { name: "進行中" },
        },
      },
      children: expect.any(Array),
    });
  });

  it("appends blocks to the manager report page", async () => {
    globalThis.process = {
      env: {
        NOTION_API_KEY: "test-key",
        NOTION_MANAGER_REPORT_PAGE_ID: "379490bb-a86d-81d0-89ed-dfce0cd0024f",
      },
    } as unknown as typeof process;

    appendBlockChildrenMock.mockResolvedValue({
      url: "https://notion.so/379490bba86d81d089eddfce0cd0024f",
    });

    const { handler } = await import("../../netlify/functions/write-to-notion");

    const response = await handler({
      httpMethod: "POST",
      body: JSON.stringify({
        entryType: "manager-update",
        mode: "quick",
        rawValues: {
          weeklyLearning: "更理解急房排序",
          weeklyObservation: "查房回報節點還不一致",
          nextWeekFocus: "先對齊交接句型",
        },
        draftResult: {
          title: "主管回報整理",
          summary: "本週先守住房況回報與跨部門銜接。",
          sections: [
            {
              key: "summary",
              title: "本週重點",
              summary: "先穩住房況回報節奏",
              bullets: ["急房排序", "交接句型"],
            },
          ],
          suggestedActions: ["和房務領班對齊回報點"],
        },
      }),
    });

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toEqual({
      ok: true,
      url: "https://notion.so/379490bba86d81d089eddfce0cd0024f",
    });
    expect(appendBlockChildrenMock).toHaveBeenCalledWith({
      apiKey: "test-key",
      pageId: "379490bb-a86d-81d0-89ed-dfce0cd0024f",
      children: expect.any(Array),
    });
  });

  it("falls back weekly review to the manager report page when a dedicated page id is absent", async () => {
    globalThis.process = {
      env: {
        NOTION_API_KEY: "test-key",
        NOTION_MANAGER_REPORT_PAGE_ID: "379490bb-a86d-81d0-89ed-dfce0cd0024f",
      },
    } as unknown as typeof process;

    appendBlockChildrenMock.mockResolvedValue({
      url: "https://notion.so/379490bba86d81d089eddfce0cd0024f",
    });

    const { handler } = await import("../../netlify/functions/write-to-notion");

    const response = await handler({
      httpMethod: "POST",
      body: JSON.stringify({
        entryType: "weekly-review",
        mode: "quick",
        rawValues: {
          weeklyGain: "更聽得懂房況回報",
          stillUnsteady: "續住房優先順序",
          nextAdjustment: "先固定交接節點",
        },
        draftResult: {
          title: "每週回顧整理",
          summary: "這週先穩住房況語言。",
          sections: [],
          suggestedActions: [],
        },
      }),
    });

    expect(response.statusCode).toBe(200);
    expect(appendBlockChildrenMock).toHaveBeenCalledWith(
      expect.objectContaining({
        pageId: "379490bb-a86d-81d0-89ed-dfce0cd0024f",
      }),
    );
  });

  it("returns a setup error when NOTION_API_KEY is missing", async () => {
    const { handler } = await import("../../netlify/functions/write-to-notion");

    const response = await handler({
      httpMethod: "POST",
      body: JSON.stringify({
        entryType: "reading-note",
        mode: "quick",
        rawValues: {
          todayReading: "先理解，再帶領",
        },
        draftResult: {
          title: "整理草稿",
          summary: "摘要",
          sections: [],
          suggestedActions: [],
        },
      }),
    });

    expect(response.statusCode).toBe(500);
    expect(JSON.parse(response.body)).toEqual({
      ok: false,
      error: "Notion 寫入服務尚未設定完成，請稍後再試。",
    });
  });

  it("returns a setup error when target env is missing for a page entry", async () => {
    globalThis.process = {
      env: {
        NOTION_API_KEY: "test-key",
        NOTION_MANAGER_REPORT_PAGE_ID: "",
        NOTION_WEEKLY_REVIEW_PAGE_ID: "",
      },
    } as unknown as typeof process;

    const { handler } = await import("../../netlify/functions/write-to-notion");

    const response = await handler({
      httpMethod: "POST",
      body: JSON.stringify({
        entryType: "manager-update",
        mode: "quick",
        rawValues: {
          weeklyLearning: "先理解房況語言",
        },
        draftResult: {
          title: "主管回報整理",
          summary: "摘要",
          sections: [],
          suggestedActions: [],
        },
      }),
    });

    expect(response.statusCode).toBe(500);
    expect(JSON.parse(response.body)).toEqual({
      ok: false,
      error: "Notion 目的地尚未設定完成，請稍後再試。",
    });
  });

  it("returns a readable client error when payload is invalid", async () => {
    const { handler } = await import("../../netlify/functions/write-to-notion");

    const response = await handler({
      httpMethod: "POST",
      body: JSON.stringify({
        entryType: "unsupported-type",
        mode: "quick",
        rawValues: {},
      }),
    });

    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body)).toEqual({
      ok: false,
      error: "Notion 寫入請求格式不正確，請回到上一頁重新送出。",
    });
  });

  it("returns a readable server error when the Notion client throws", async () => {
    globalThis.process = {
      env: {
        NOTION_API_KEY: "test-key",
      },
    } as unknown as typeof process;

    createDatabasePageMock.mockRejectedValue(new Error("notion failed"));

    const { handler } = await import("../../netlify/functions/write-to-notion");

    const response = await handler({
      httpMethod: "POST",
      body: JSON.stringify({
        entryType: "reading-note",
        mode: "quick",
        rawValues: {
          todayReading: "先理解，再帶領",
          triggeredThought: "先觀察",
        },
        draftResult: {
          title: "整理草稿",
          summary: "摘要",
          sections: [],
          suggestedActions: [],
        },
      }),
    });

    expect(response.statusCode).toBe(500);
    expect(JSON.parse(response.body)).toEqual({
      ok: false,
      error: "寫入 Notion 失敗，請稍後再試。",
    });
  });
});
