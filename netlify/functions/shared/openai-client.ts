import { buildTransformPrompt } from "../../../src/utils/prompt-builders";
import type { TransformEntryPayload } from "../../../src/lib/types";
import { parseStructuredDraftResponse, structuredDraftFormat } from "./payload-schemas";

type OpenAIClientOptions = {
  apiKey: string;
  model?: string;
  baseUrl?: string;
  fetchImpl?: typeof fetch;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function extractStructuredOutput(responseBody: unknown): unknown {
  if (!isRecord(responseBody)) {
    return null;
  }

  if (isRecord(responseBody.output_parsed)) {
    return responseBody.output_parsed;
  }

  if (typeof responseBody.output_text === "string") {
    try {
      return JSON.parse(responseBody.output_text);
    } catch {
      return null;
    }
  }

  if (!Array.isArray(responseBody.output)) {
    return null;
  }

  for (const outputItem of responseBody.output) {
    if (!isRecord(outputItem) || !Array.isArray(outputItem.content)) {
      continue;
    }

    for (const contentItem of outputItem.content) {
      if (!isRecord(contentItem)) {
        continue;
      }

      if (isRecord(contentItem.parsed)) {
        return contentItem.parsed;
      }

      if (typeof contentItem.text === "string") {
        try {
          return JSON.parse(contentItem.text);
        } catch {
          continue;
        }
      }
    }
  }

  return null;
}

export async function createStructuredDraft(
  payload: TransformEntryPayload,
  options: OpenAIClientOptions,
) {
  const { apiKey, baseUrl = "https://api.openai.com/v1/responses", fetchImpl = fetch } = options;
  const model = options.model || "gpt-4.1-mini";
  const prompt = buildTransformPrompt(payload);

  const response = await fetchImpl(baseUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      input: [
        {
          role: "system",
          content: prompt.systemPrompt,
        },
        {
          role: "user",
          content: prompt.userPrompt,
        },
      ],
      text: {
        format: structuredDraftFormat,
      },
    }),
  });

  if (!response.ok) {
    throw new Error("OpenAI transform request failed");
  }

  const responseBody = await response.json();
  const structuredOutput = extractStructuredOutput(responseBody);

  if (!structuredOutput) {
    throw new Error("OpenAI transform response was not structured");
  }

  const parsedDraft = parseStructuredDraftResponse(structuredOutput);

  if (!parsedDraft) {
    throw new Error("OpenAI transform response broke structured contract");
  }

  return parsedDraft;
}
