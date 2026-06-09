import { entryTypeIds, type DraftResult, type EntryTypeId, type WriteToNotionPayload } from "./types";

type NotionRichText = {
  type: "text";
  text: {
    content: string;
  };
};

type NotionParagraphBlock = {
  object: "block";
  type: "paragraph" | "heading_2" | "bulleted_list_item";
  paragraph?: {
    rich_text: NotionRichText[];
  };
  heading_2?: {
    rich_text: NotionRichText[];
  };
  bulleted_list_item?: {
    rich_text: NotionRichText[];
  };
};

type NotionTitleProperty = {
  title: NotionRichText[];
};

type NotionRichTextProperty = {
  rich_text: NotionRichText[];
};

type NotionDateProperty = {
  date: {
    start: string;
  };
};

type NotionSelectProperty = {
  select: {
    name: string;
  };
};

type NotionStatusProperty = {
  status: {
    name: string;
  };
};

type NotionMultiSelectProperty = {
  multi_select: Array<{
    name: string;
  }>;
};

export type NotionPropertyValue =
  | NotionTitleProperty
  | NotionRichTextProperty
  | NotionDateProperty
  | NotionSelectProperty
  | NotionStatusProperty
  | NotionMultiSelectProperty;

export type NotionProperties = Record<string, NotionPropertyValue>;

export type BuiltNotionWritePayload = {
  entryType: EntryTypeId;
  properties?: NotionProperties;
  children: NotionParagraphBlock[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function isStringRecord(value: unknown): value is Record<string, string> {
  return (
    isRecord(value) &&
    Object.values(value).every((item) => typeof item === "string")
  );
}

function isDraftSection(value: unknown): value is DraftResult["sections"][number] {
  return (
    isRecord(value) &&
    typeof value.key === "string" &&
    typeof value.title === "string" &&
    typeof value.summary === "string" &&
    Array.isArray(value.bullets) &&
    value.bullets.every((item) => typeof item === "string")
  );
}

function isDraftResult(value: unknown): value is DraftResult {
  return (
    isRecord(value) &&
    typeof value.title === "string" &&
    typeof value.summary === "string" &&
    Array.isArray(value.sections) &&
    value.sections.every(isDraftSection) &&
    Array.isArray(value.suggestedActions) &&
    value.suggestedActions.every((item) => typeof item === "string")
  );
}

export function parseWriteToNotionPayload(value: unknown): WriteToNotionPayload | null {
  if (!isRecord(value)) {
    return null;
  }

  const { entryType, mode, rawValues, draftResult } = value;

  if (typeof entryType !== "string" || !entryTypeIds.includes(entryType as EntryTypeId)) {
    return null;
  }

  if (mode !== "quick" && mode !== "detailed") {
    return null;
  }

  if (!isStringRecord(rawValues) || !isDraftResult(draftResult)) {
    return null;
  }

  return {
    entryType: entryType as EntryTypeId,
    mode,
    rawValues,
    draftResult,
  };
}

function normalizeText(value: string | undefined, fallback = ""): string {
  return typeof value === "string" ? value.trim() || fallback : fallback;
}

function truncateText(value: string, maxLength = 1800): string {
  return value.length > maxLength ? `${value.slice(0, maxLength - 1)}…` : value;
}

function richText(content: string): NotionRichText[] {
  const normalized = truncateText(content.trim());

  if (!normalized) {
    return [];
  }

  return [
    {
      type: "text",
      text: {
        content: normalized,
      },
    },
  ];
}

function titleProperty(content: string): NotionTitleProperty {
  return {
    title: richText(content || "未命名"),
  };
}

function textProperty(content: string): NotionRichTextProperty {
  return {
    rich_text: richText(content),
  };
}

function dateProperty(date: string): NotionDateProperty {
  return {
    date: {
      start: date,
    },
  };
}

function getTaipeiDateString(date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function selectProperty(name: string): NotionSelectProperty {
  return {
    select: {
      name,
    },
  };
}

function statusProperty(name: string): NotionStatusProperty {
  return {
    status: {
      name,
    },
  };
}

function multiSelectProperty(names: string[]): NotionMultiSelectProperty {
  return {
    multi_select: names.map((name) => ({
      name,
    })),
  };
}

function paragraph(content: string): NotionParagraphBlock {
  return {
    object: "block",
    type: "paragraph",
    paragraph: {
      rich_text: richText(content),
    },
  };
}

function heading(content: string): NotionParagraphBlock {
  return {
    object: "block",
    type: "heading_2",
    heading_2: {
      rich_text: richText(content),
    },
  };
}

function bullet(content: string): NotionParagraphBlock {
  return {
    object: "block",
    type: "bulleted_list_item",
    bulleted_list_item: {
      rich_text: richText(content),
    },
  };
}

function buildCommonChildren(
  payload: WriteToNotionPayload,
  options?: { includeSummary?: boolean },
): NotionParagraphBlock[] {
  const children: NotionParagraphBlock[] = [];
  const includeSummary = options?.includeSummary ?? true;

  if (includeSummary && payload.draftResult.summary) {
    children.push(paragraph(payload.draftResult.summary));
  }

  for (const section of payload.draftResult.sections) {
    children.push(heading(section.title));

    if (section.summary) {
      children.push(paragraph(section.summary));
    }

    for (const item of section.bullets) {
      children.push(bullet(item));
    }
  }

  if (payload.draftResult.suggestedActions.length > 0) {
    children.push(heading("下一步"));

    for (const action of payload.draftResult.suggestedActions) {
      children.push(bullet(action));
    }
  }

  return children;
}

function buildProperties(
  entries: Array<[string, NotionPropertyValue | null]>,
): NotionProperties {
  return entries.reduce<NotionProperties>((result, [key, value]) => {
    if (value) {
      result[key] = value;
    }

    return result;
  }, {});
}

function inferSingleOption(
  rawValue: string | undefined,
  allowedOptions: readonly string[],
  aliases?: Record<string, string>,
): string | null {
  const normalized = normalizeText(rawValue);

  if (!normalized) {
    return null;
  }

  if (allowedOptions.includes(normalized)) {
    return normalized;
  }

  if (aliases) {
    for (const [matcher, resolved] of Object.entries(aliases)) {
      if (normalized.includes(matcher) && allowedOptions.includes(resolved)) {
        return resolved;
      }
    }
  }

  return null;
}

function inferMultiOptions(
  rawValue: string | undefined,
  allowedOptions: readonly string[],
  aliases?: Record<string, string>,
): string[] {
  let normalized = normalizeText(rawValue);

  if (!normalized) {
    return [];
  }

  const matched = new Set<string>();

  if (aliases) {
    for (const [matcher, resolved] of Object.entries(aliases)) {
      if (normalized.includes(matcher) && allowedOptions.includes(resolved)) {
        matched.add(resolved);
        normalized = normalized.split(matcher).join(" ");
      }
    }
  }

  for (const option of allowedOptions) {
    if (normalized.includes(option)) {
      matched.add(option);
    }
  }

  return [...matched];
}

function inferReadingNoteIpa(payload: WriteToNotionPayload): string {
  if (normalizeText(payload.rawValues.nextWeekAction)) {
    return "行動 Action";
  }

  if (normalizeText(payload.rawValues.leadershipReminder)) {
    return "人才 People";
  }

  return "構想 Idea";
}

function buildReadingNotePayload(payload: WriteToNotionPayload): BuiltNotionWritePayload {
  const { rawValues, draftResult } = payload;

  return {
    entryType: payload.entryType,
    properties: buildProperties([
      ["筆記標題", titleProperty(normalizeText(draftResult.title, "讀書筆記"))],
      ["章節", textProperty(normalizeText(draftResult.sections[0]?.title))],
      ["IPA", selectProperty(inferReadingNoteIpa(payload))],
      [
        "核心觀念",
        textProperty(
          normalizeText(
            rawValues.bookConcept,
            normalizeText(rawValues.todayReading, draftResult.summary),
          ),
        ),
      ],
      [
        "對我的提醒",
        textProperty(
          normalizeText(rawValues.leadershipReminder, normalizeText(rawValues.triggeredThought)),
        ),
      ],
      [
        "可執行行動",
        textProperty(
          normalizeText(rawValues.nextWeekAction, normalizeText(draftResult.suggestedActions[0])),
        ),
      ],
      ["重要程度", selectProperty("中")],
    ]),
    children: buildCommonChildren(payload),
  };
}

function buildFieldObservationPayload(payload: WriteToNotionPayload): BuiltNotionWritePayload {
  const { rawValues, draftResult } = payload;
  const scene = inferSingleOption(
    rawValues.scene || rawValues.frictionPoint,
    ["退房", "續住", "查房", "備品", "布巾", "遺留物", "維修", "房況", "跨部門溝通"],
    {
      "退房清潔": "退房",
      "續住房整理": "續住",
      "續住房": "續住",
      "備品補充": "備品",
      "布巾管理": "布巾",
      "房況回報": "房況",
      "跨部門": "跨部門溝通",
    },
  );

  return {
    entryType: payload.entryType,
    properties: buildProperties([
      [
        "觀察主題",
        titleProperty(
          normalizeText(rawValues.scene, normalizeText(rawValues.todaySeen, draftResult.title)),
        ),
      ],
      ["日期", dateProperty(getTaipeiDateString())],
      ["場景", scene ? selectProperty(scene) : null],
      [
        "我看到的流程",
        textProperty(normalizeText(rawValues.processSeen, normalizeText(rawValues.todaySeen))),
      ],
      ["我不懂的地方", textProperty(normalizeText(rawValues.unknowns))],
      [
        "對客務的影響",
        textProperty(
          normalizeText(rawValues.impactOnFrontDesk, normalizeText(rawValues.firstFeeling)),
        ),
      ],
      ["可改善處", textProperty(normalizeText(rawValues.improvementIdea))],
    ]),
    children: buildCommonChildren(payload),
  };
}

function buildTeamInteractionPayload(payload: WriteToNotionPayload): BuiltNotionWritePayload {
  const { rawValues } = payload;
  const role = inferSingleOption(
    rawValues.role || rawValues.whoSpokeWith,
    ["主管", "領班", "房務員", "客務主管", "工程", "其他"],
    {
      "房務主管": "主管",
      "資深房務員": "房務員",
      "櫃檯": "客務主管",
    },
  );
  const status =
    normalizeText(rawValues.nextAction) || normalizeText(rawValues.supportIcanOffer)
      ? "進行中"
      : "未開始";

  return {
    entryType: payload.entryType,
    properties: buildProperties([
      [
        "對象",
        titleProperty(
          normalizeText(rawValues.counterpart, normalizeText(rawValues.whoSpokeWith, "待補對象")),
        ),
      ],
      ["角色", role ? selectProperty(role) : null],
      [
        "對方可能在意",
        textProperty(
          normalizeText(rawValues.likelyConcern, normalizeText(rawValues.whatTheyCareAbout)),
        ),
      ],
      [
        "我聽到的困難",
        textProperty(normalizeText(rawValues.painPointHeard, normalizeText(rawValues.whatIHeard))),
      ],
      ["我可以支援的地方", textProperty(normalizeText(rawValues.supportIcanOffer))],
      ["下一步行動", textProperty(normalizeText(rawValues.nextAction))],
      ["狀態", statusProperty(status)],
    ]),
    children: buildCommonChildren(payload),
  };
}

function buildImprovementIdeaPayload(payload: WriteToNotionPayload): BuiltNotionWritePayload {
  const { rawValues, draftResult } = payload;
  const category = inferSingleOption(
    rawValues.category || rawValues.whatFeelsOff,
    ["房況", "清潔", "查房", "備品", "布巾", "遺留物", "維修", "跨部門溝通"],
    {
      "退房清潔": "清潔",
      "房況回報": "房況",
      "跨部門": "跨部門溝通",
    },
  );
  const impactedPeople = inferMultiOptions(
    rawValues.affectedPeople || rawValues.whoIsAffected,
    ["客人", "櫃檯", "房務", "工程", "主管"],
    {
      "旅客": "客人",
      "前台": "櫃檯",
      "房務主管": "主管",
    },
  );
  const severity = inferSingleOption(rawValues.severity, ["高", "中", "低"]) ?? "中";
  const frequency =
    inferSingleOption(rawValues.frequency, ["經常", "偶爾", "少見", "待觀察"], {
      每天: "經常",
      常常: "經常",
    }) ?? "待觀察";
  const status =
    normalizeText(rawValues.initialIdea) || normalizeText(rawValues.possibleCauses)
      ? "進行中"
      : "未開始";

  return {
    entryType: payload.entryType,
    properties: buildProperties([
      [
        "議題名稱",
        titleProperty(
          normalizeText(rawValues.topic, normalizeText(rawValues.whatHappened, draftResult.title)),
        ),
      ],
      ["類型", category ? selectProperty(category) : null],
      ["影響對象", impactedPeople.length > 0 ? multiSelectProperty(impactedPeople) : null],
      ["嚴重度", selectProperty(severity)],
      ["發生頻率", selectProperty(frequency)],
      [
        "目前狀況",
        textProperty(normalizeText(rawValues.currentSituation, normalizeText(rawValues.whatFeelsOff))),
      ],
      ["可能原因", textProperty(normalizeText(rawValues.possibleCauses))],
      ["初步想法", textProperty(normalizeText(rawValues.initialIdea))],
      ["狀態", statusProperty(status)],
    ]),
    children: buildCommonChildren(payload),
  };
}

function buildPageContentPayload(payload: WriteToNotionPayload): BuiltNotionWritePayload {
  return {
    entryType: payload.entryType,
    children: [
      heading(payload.draftResult.title),
      paragraph(payload.draftResult.summary),
      ...buildCommonChildren(payload, { includeSummary: false }),
    ],
  };
}

export function buildNotionWritePayload(
  payload: WriteToNotionPayload,
): BuiltNotionWritePayload {
  switch (payload.entryType) {
    case "reading-note":
      return buildReadingNotePayload(payload);
    case "field-observation":
      return buildFieldObservationPayload(payload);
    case "team-interaction":
      return buildTeamInteractionPayload(payload);
    case "improvement-idea":
      return buildImprovementIdeaPayload(payload);
    case "manager-update":
    case "weekly-review":
      return buildPageContentPayload(payload);
  }
}
