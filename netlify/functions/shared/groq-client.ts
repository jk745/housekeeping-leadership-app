import { buildTransformPrompt } from "../../../src/utils/prompt-builders";
import type { TransformEntryPayload } from "../../../src/lib/types";
import { parseStructuredDraftResponse } from "./payload-schemas";
import { structuredDraftSchema } from "./payload-schemas";

type GroqClientOptions = {
  apiKey: string;
  model?: string;
};

export async function createStructuredDraftWithGroq(
  payload: TransformEntryPayload,
  options: GroqClientOptions,
) {
  const { apiKey } = options;
  const model = options.model ?? "llama-3.3-70b-versatile";
  const prompt = buildTransformPrompt(payload);

  const schemaStr = JSON.stringify(structuredDraftSchema, null, 2);
  const systemWithSchema = [
    prompt.systemPrompt,
    "",
    "你必須以 JSON 格式回答，結構如下：",
    "```json",
    schemaStr,
    "```",
    "不要輸出任何 JSON 以外的內容。",
  ].join("\n");

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemWithSchema },
        { role: "user", content: prompt.userPrompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => "");
    throw new Error(`Groq request failed: ${errText}`);
  }

  const body = await response.json() as Record<string, unknown>;
  const choices = body?.choices as Array<Record<string, unknown>> | undefined;
  const rawText = (choices?.[0]?.message as Record<string, unknown> | undefined)?.content;

  if (typeof rawText !== "string" || !rawText) {
    throw new Error("Groq response was empty");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawText);
  } catch {
    throw new Error("Groq response was not valid JSON");
  }

  const validatedDraft = parseStructuredDraftResponse(parsed);

  if (!validatedDraft) {
    throw new Error("Groq response broke structured contract");
  }

  return validatedDraft;
}
