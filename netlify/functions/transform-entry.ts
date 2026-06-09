import { createStructuredDraftWithGemini } from "./shared/gemini-client";
import {
  parseStructuredDraftResponse,
  parseTransformEntryPayload,
} from "./shared/payload-schemas";

type NetlifyFunctionEvent = {
  httpMethod?: string;
  body?: string | null;
};

type NetlifyFunctionResponse = {
  statusCode: number;
  headers?: Record<string, string>;
  body: string;
};

const JSON_HEADERS = {
  "Content-Type": "application/json; charset=utf-8",
};

function json(statusCode: number, body: Record<string, unknown>): NetlifyFunctionResponse {
  return {
    statusCode,
    headers: JSON_HEADERS,
    body: JSON.stringify(body),
  };
}

function getEnv(name: string) {
  const env = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env;
  return env?.[name];
}

export async function handler(event: NetlifyFunctionEvent): Promise<NetlifyFunctionResponse> {
  if (event.httpMethod && event.httpMethod !== "POST") {
    return json(405, {
      ok: false,
      error: "這個整理服務目前只接受 POST 請求。",
    });
  }

  let parsedBody: unknown;

  try {
    parsedBody = event.body ? JSON.parse(event.body) : null;
  } catch {
    return json(400, {
      ok: false,
      error: "整理請求格式不正確，請回到上一頁重新送出。",
    });
  }

  const payload = parseTransformEntryPayload(parsedBody);

  if (!payload) {
    return json(400, {
      ok: false,
      error: "整理請求格式不正確，請回到上一頁重新送出。",
    });
  }

  const apiKey = getEnv("GEMINI_API_KEY");

  if (!apiKey) {
    return json(500, {
      ok: false,
      error: "整理服務尚未設定完成，請稍後再試。",
    });
  }

  try {
    const draft = await createStructuredDraftWithGemini(payload, {
      apiKey,
      model: getEnv("GEMINI_TRANSFORM_MODEL"),
    });
    const validatedDraft = parseStructuredDraftResponse(draft);

    if (!validatedDraft) {
      return json(500, {
        ok: false,
        error: "整理結果格式不完整，請稍後再試。",
      });
    }

    return json(200, {
      ok: true,
      draft: validatedDraft,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "Gemini response broke structured contract"
    ) {
      return json(500, {
        ok: false,
        error: "整理結果格式不完整，請稍後再試。",
      });
    }

    return json(500, {
      ok: false,
      error: "目前無法完成整理，請稍後再試。",
    });
  }
}
