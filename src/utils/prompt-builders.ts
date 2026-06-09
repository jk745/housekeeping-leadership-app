import { getEntryTypeConfig } from "../lib/entry-types";
import type { TransformEntryPayload } from "../lib/types";
import { getFieldsForEntryMode } from "./form-builders";

function formatRawValues(payload: TransformEntryPayload) {
  const fields = getFieldsForEntryMode(payload.entryType, payload.mode);

  return fields
    .map((field) => {
      const value = payload.rawValues[field.name]?.trim() || "尚未填寫";
      return `- ${field.label}：${value}`;
    })
    .join("\n");
}

export function buildTransformPrompt(payload: TransformEntryPayload) {
  const config = getEntryTypeConfig(payload.entryType);

  return {
    systemPrompt: [
      "你是協助使用者從客務部櫃檯主任轉任房務部領導角色的整理助理。",
      "請全程使用繁體中文，語氣支持、務實、清楚、能落地執行。",
      "請記住原則：先理解，再帶領；先信任，再要求；先穩定，再改善。",
      "請把輸入整理成可供 review 頁呈現的結構化草稿，不要提及 Notion，也不要安排寫入行為。",
      "sections 請聚焦現場理解、帶人判斷與下一步，不要空泛。",
    ].join("\n"),
    userPrompt: [
      `整理類型：${config.label}`,
      `整理模式：${payload.mode === "quick" ? "快速整理" : "完整整理"}`,
      `類型說明：${config.description}`,
      "",
      "使用者原始輸入：",
      formatRawValues(payload),
      "",
      "請產出：",
      "1. 一個清楚的草稿標題",
      "2. 一段 2 到 3 句的整理摘要",
      "3. 2 到 4 個 sections，每個 section 要有 title、summary、bullets",
      "4. 0 到 3 個 suggestedActions，內容要能在房務現場落地",
    ].join("\n"),
  };
}
