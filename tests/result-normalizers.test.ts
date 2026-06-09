import { describe, expect, it } from "vitest";
import { normalizeDraftResult } from "../src/lib/result-normalizers";

describe("normalizeDraftResult", () => {
  it("keeps valid structured sections and trims noisy values", () => {
    const result = normalizeDraftResult({
      title: "  讀書筆記整理  ",
      summary: " 先把方向穩住。 ",
      sections: [
        {
          key: "focus",
          title: "  這次重點 ",
          summary: " 先理解，再帶領 ",
          bullets: [" 跟房兩次 ", "", " 觀察查房交接 "],
        },
        {
          key: "",
          title: "  ",
          summary: "",
          bullets: [],
        },
      ],
      suggestedActions: [" 先跟房 ", "", " 補記房況回報節點 "],
    });

    expect(result.title).toBe("讀書筆記整理");
    expect(result.summary).toBe("先把方向穩住。");
    expect(result.sections).toEqual([
      {
        key: "focus",
        title: "這次重點",
        summary: "先理解，再帶領",
        bullets: ["跟房兩次", "觀察查房交接"],
      },
    ]);
    expect(result.suggestedActions).toEqual(["先跟房", "補記房況回報節點"]);
  });

  it("falls back to readable defaults when the model output is incomplete", () => {
    const result = normalizeDraftResult({
      sections: [
        {
          title: "只有標題",
        },
      ],
    });

    expect(result.title).toBe("整理草稿");
    expect(result.summary).toBe("已完成初步整理，請先確認內容是否貼近現場。");
    expect(result.sections).toEqual([
      {
        key: "section-1",
        title: "只有標題",
        summary: "尚未提供摘要。",
        bullets: [],
      },
    ]);
    expect(result.suggestedActions).toEqual([]);
  });
});
