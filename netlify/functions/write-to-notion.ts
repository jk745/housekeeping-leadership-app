import { buildNotionWritePayload, parseWriteToNotionPayload } from "../../src/lib/notion-payloads";
import { getNotionTarget, resolveNotionPageTargetId } from "../../src/lib/notion-targets";
import { appendBlockChildren, createDatabasePage } from "./shared/notion-client";

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

function getEnvMap() {
  return (
    (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env ?? {}
  );
}

export async function handler(event: NetlifyFunctionEvent): Promise<NetlifyFunctionResponse> {
  if (event.httpMethod && event.httpMethod !== "POST") {
    return json(405, {
      ok: false,
      error: "這個 Notion 寫入服務目前只接受 POST 請求。",
    });
  }

  let parsedBody: unknown;

  try {
    parsedBody = event.body ? JSON.parse(event.body) : null;
  } catch {
    return json(400, {
      ok: false,
      error: "Notion 寫入請求格式不正確，請回到上一頁重新送出。",
    });
  }

  const payload = parseWriteToNotionPayload(parsedBody);

  if (!payload) {
    return json(400, {
      ok: false,
      error: "Notion 寫入請求格式不正確，請回到上一頁重新送出。",
    });
  }

  const env = getEnvMap();
  const apiKey = env.NOTION_API_KEY?.trim();

  if (!apiKey) {
    return json(500, {
      ok: false,
      error: "Notion 寫入服務尚未設定完成，請稍後再試。",
    });
  }

  const target = getNotionTarget(payload.entryType);
  const notionPayload = buildNotionWritePayload(payload);

  try {
    if (target.kind === "database") {
      const parentId = target.targetId ?? (target.envKey ? env[target.envKey]?.trim() : undefined);

      if (!parentId) {
        return json(500, {
          ok: false,
          error: "Notion 目的地尚未設定完成，請稍後再試。",
        });
      }

      const page = await createDatabasePage({
        apiKey,
        parentId,
        properties: notionPayload.properties ?? {},
        children: notionPayload.children,
      });

      return json(200, {
        ok: true,
        url: page.url,
      });
    }

    const pageId = resolveNotionPageTargetId(target, env);
    console.log('[write-to-notion] entryType:', payload.entryType, '| pageId used:', JSON.stringify(pageId));

    if (!pageId) {
      return json(500, {
        ok: false,
        error: "Notion 目的地尚未設定完成，請稍後再試。",
      });
    }

    const result = await appendBlockChildren({
      apiKey,
      pageId,
      children: notionPayload.children,
    });

    return json(200, {
      ok: true,
      url: result.url,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[write-to-notion] error:', msg);
    return json(500, {
      ok: false,
      error: '寫入 Notion 失敗：' + msg,
    });
  }
}
