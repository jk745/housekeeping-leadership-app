import { buildTransformPrompt } from "../../../src/utils/prompt-builders";
import type { TransformEntryPayload } from "../../../src/lib/types";
import { parseStructuredDraftResponse } from "./payload-schemas";

type GeminiClientOptions = {
  apiKey: string;
  model?: string;
};

const geminiResponseSchema = {
  type: "object",
  required: ["title", "summary", "sections", "suggestedActions"],
  properties: {
    title: { type: "string" },
    summary: { type: "string" },
    sections: {
      type: "array",
      items: {
        type: "object",
        required: ["key", "title", "summary", "bullets"],
        properties: {
          key: { type: "string" },
          title: { type: "string" },
          summary: { type: "string" },
          bullets: {
            type: "array",
            items: { type: "string" },
          },
        },
      },
    },
    suggestedActions: {
      type: "array",
      items: { type: "string" },
    },
  },
};

export async function createStructuredDraftWithGemini(
  payload: TransformEntryPayload,
  options: GeminiClientOptions,
) {
  const { apiKey } = options;
  const model = options.model ?? "gemini-2.0-flash";
  const prompt = buildTransformPrompt(payload);

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: prompt.systemPrompt }],
      },
      contents: [
        {
          role: "user",
          parts: [{ text: prompt.userPrompt }],
        },
      ],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: geminiResponseSchema,
      },
    }),
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => "");
    throw new Error(`Gemini request failed: ${errText}`);
  }

  const body = await response.json() as Record<string, unknown>;
  const candidates = body?.candidates as Array<Record<string, unknown>> | undefined;
  const text = (candidates?.[0]?.content as Record<string, unknown> | undefined)
    ?.parts as Array<Record<string, unknown>> | undefined;
  const rawText = text?.[0]?.text;

  if (typeof rawText !== "string" || !rawText) {
    throw new Error("Gemini response was empty");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawText);
  } catch {
    throw new Error("Gemini response was not valid JSON");
  }

  const validatedDraft = parseStructuredDraftResponse(parsed);

  if (!validatedDraft) {
    throw new Error("Gemini response broke structured contract");
  }

  return validatedDraft;
}
