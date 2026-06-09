import { afterEach, describe, expect, it, vi } from "vitest";

const createStructuredDraftMock = vi.fn();

vi.mock("../../netlify/functions/shared/openai-client", () => ({
  createStructuredDraft: createStructuredDraftMock,
}));

describe("transform-entry function", () => {
  const originalProcess = globalThis.process;

  afterEach(() => {
    createStructuredDraftMock.mockReset();
    vi.resetModules();
    globalThis.process = originalProcess;
  });

  it("returns normalized structured output for a valid transform request", async () => {
    globalThis.process = {
      env: {
        OPENAI_API_KEY: "test-key",
      },
    } as unknown as typeof process;

    createStructuredDraftMock.mockResolvedValue({
      title: "讀書筆記整理",
      summary: "先穩住上任初期的觀察節奏。",
      sections: [
        {
          key: "focus",
          title: "這次重點",
          summary: "先理解，再帶領",
          bullets: ["跟房觀察", "補記查房節點"],
        },
      ],
      suggestedActions: ["先跟房兩次"],
    });

    const { handler } = await import("../../netlify/functions/transform-entry");

    const response = await handler({
      httpMethod: "POST",
      body: JSON.stringify({
        entryType: "reading-note",
        mode: "quick",
        rawValues: {
          todayReading: "先理解，再帶領",
          triggeredThought: "先不要急著改流程",
        },
      }),
    });

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toEqual({
      ok: true,
      draft: {
        title: "讀書筆記整理",
        summary: "先穩住上任初期的觀察節奏。",
        sections: [
          {
            key: "focus",
            title: "這次重點",
            summary: "先理解，再帶領",
            bullets: ["跟房觀察", "補記查房節點"],
          },
        ],
        suggestedActions: ["先跟房兩次"],
      },
    });
    expect(createStructuredDraftMock).toHaveBeenCalledTimes(1);
  });

  it("returns a readable client error when payload is invalid", async () => {
    const { handler } = await import("../../netlify/functions/transform-entry");

    const response = await handler({
      httpMethod: "POST",
      body: JSON.stringify({
        entryType: "unknown-type",
        mode: "quick",
        rawValues: {},
      }),
    });

    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body)).toEqual({
      ok: false,
      error: "整理請求格式不正確，請回到上一頁重新送出。",
    });
    expect(createStructuredDraftMock).not.toHaveBeenCalled();
  });

  it("returns a setup error when OPENAI_API_KEY is missing", async () => {
    const { handler } = await import("../../netlify/functions/transform-entry");

    const response = await handler({
      httpMethod: "POST",
      body: JSON.stringify({
        entryType: "reading-note",
        mode: "quick",
        rawValues: {
          todayReading: "先理解，再帶領",
        },
      }),
    });

    expect(response.statusCode).toBe(500);
    expect(JSON.parse(response.body)).toEqual({
      ok: false,
      error: "整理服務尚未設定完成，請稍後再試。",
    });
    expect(createStructuredDraftMock).not.toHaveBeenCalled();
  });

  it("returns a readable server error when OpenAI client throws", async () => {
    globalThis.process = {
      env: {
        OPENAI_API_KEY: "test-key",
      },
    } as unknown as typeof process;

    createStructuredDraftMock.mockRejectedValue(new Error("upstream failed"));

    const { handler } = await import("../../netlify/functions/transform-entry");

    const response = await handler({
      httpMethod: "POST",
      body: JSON.stringify({
        entryType: "reading-note",
        mode: "quick",
        rawValues: {
          todayReading: "先理解，再帶領",
        },
      }),
    });

    expect(response.statusCode).toBe(500);
    expect(JSON.parse(response.body)).toEqual({
      ok: false,
      error: "目前無法完成整理，請稍後再試。",
    });
  });

  it("returns a server error when model output breaks the structured contract", async () => {
    globalThis.process = {
      env: {
        OPENAI_API_KEY: "test-key",
      },
    } as unknown as typeof process;

    createStructuredDraftMock.mockResolvedValue({
      title: "讀書筆記整理",
      summary: "少了 sections 與 suggestedActions",
    });

    const { handler } = await import("../../netlify/functions/transform-entry");

    const response = await handler({
      httpMethod: "POST",
      body: JSON.stringify({
        entryType: "reading-note",
        mode: "quick",
        rawValues: {
          todayReading: "先理解，再帶領",
        },
      }),
    });

    expect(response.statusCode).toBe(500);
    expect(JSON.parse(response.body)).toEqual({
      ok: false,
      error: "整理結果格式不完整，請稍後再試。",
    });
  });
});
