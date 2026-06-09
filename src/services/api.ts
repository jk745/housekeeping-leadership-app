import { normalizeDraftResult } from "../lib/result-normalizers";
import type {
  DraftResult,
  TransformEntryPayload,
  WriteToNotionPayload,
  WriteToNotionResult,
} from "../lib/types";

type TransformSuccessResponse = {
  ok: true;
  draft: unknown;
};

type TransformErrorResponse = {
  ok: false;
  error?: string;
};

type WriteSuccessResponse = {
  ok: true;
  url: string;
};

type WriteErrorResponse = {
  ok: false;
  error?: string;
};

const FALLBACK_ERROR = "目前無法完成整理，請稍後再試。";
const FALLBACK_WRITE_ERROR = "寫入 Notion 失敗，請稍後再試。";

export async function transformEntry(payload: TransformEntryPayload): Promise<DraftResult> {
  const response = await fetch("/.netlify/functions/transform-entry", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = (await response.json().catch(() => null)) as
    | TransformSuccessResponse
    | TransformErrorResponse
    | null;

  if (!response.ok || !data || data.ok !== true) {
    const errorMessage =
      data && "error" in data && typeof data.error === "string" ? data.error : FALLBACK_ERROR;
    throw new Error(errorMessage);
  }

  return normalizeDraftResult(data.draft);
}

export async function writeToNotion(
  payload: WriteToNotionPayload,
): Promise<WriteToNotionResult> {
  const response = await fetch("/.netlify/functions/write-to-notion", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = (await response.json().catch(() => null)) as
    | WriteSuccessResponse
    | WriteErrorResponse
    | null;

  if (!response.ok || !data || data.ok !== true || typeof data.url !== "string") {
    const errorMessage =
      data && "error" in data && typeof data.error === "string"
        ? data.error
        : FALLBACK_WRITE_ERROR;
    throw new Error(errorMessage);
  }

  return {
    url: data.url,
  };
}
