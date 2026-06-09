import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("app setup docs", () => {
  it(".env.example lists the required OpenAI and Notion variables", () => {
    const envExample = readFileSync(".env.example", "utf8");

    expect(envExample).toContain("OPENAI_API_KEY=");
    expect(envExample).toContain("NOTION_API_KEY=");
    expect(envExample).toContain("NOTION_MANAGER_REPORT_PAGE_ID=");
    expect(envExample).toContain("NOTION_WEEKLY_REVIEW_PAGE_ID=");
  });

  it("README_APP explains local setup and phone usage flow", () => {
    const readme = readFileSync("README_APP.md", "utf8");

    expect(readme).toContain("APP Local Setup");
    expect(readme).toContain("npx netlify dev");
    expect(readme).toContain("手機");
    expect(readme).toContain("先理解，再帶領；先信任，再要求；先穩定，再改善。");
  });
});
