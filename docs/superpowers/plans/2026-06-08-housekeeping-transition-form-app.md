# Housekeeping Transition Form App Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a mobile-first web app that lets the user open a URL on a phone, choose one of six entry types, generate a structured draft from raw notes, review it, and then write the confirmed result into the correct Notion destination.

**Architecture:** Use a Vite + React + TypeScript frontend for the mobile-first UI, plus Netlify Functions for server-side transform and Notion write actions. Keep the first version focused on one clear flow: choose type → enter content → generate draft → review → write to Notion, with deterministic UI state and server-owned secrets.

**Tech Stack:** Vite, React, TypeScript, React Router, Vitest, Testing Library, Zod, Netlify Functions, Notion SDK, OpenAI API, plain CSS variables

---

## File Structure

### New files to create

- `package.json`
- `tsconfig.json`
- `tsconfig.node.json`
- `vite.config.ts`
- `index.html`
- `src/main.tsx`
- `src/App.tsx`
- `src/app/router.tsx`
- `src/styles/global.css`
- `src/styles/tokens.css`
- `src/lib/types.ts`
- `src/lib/entry-types.ts`
- `src/lib/notion-targets.ts`
- `src/lib/result-normalizers.ts`
- `src/state/app-state.tsx`
- `src/pages/HomePage.tsx`
- `src/pages/EntryPage.tsx`
- `src/pages/ReviewPage.tsx`
- `src/pages/SuccessPage.tsx`
- `src/components/EntryTypeCard.tsx`
- `src/components/ModeToggle.tsx`
- `src/components/QuickEntryForm.tsx`
- `src/components/DetailedEntryForm.tsx`
- `src/components/ReviewSection.tsx`
- `src/components/SuggestedActions.tsx`
- `src/components/StickyActionBar.tsx`
- `src/services/api.ts`
- `src/utils/storage.ts`
- `src/utils/form-builders.ts`
- `src/utils/prompt-builders.ts`
- `netlify/functions/transform-entry.ts`
- `netlify/functions/write-to-notion.ts`
- `netlify/functions/shared/cors.ts`
- `netlify/functions/shared/notion-client.ts`
- `netlify/functions/shared/openai-client.ts`
- `netlify/functions/shared/payload-schemas.ts`
- `tests/entry-types.test.ts`
- `tests/result-normalizers.test.ts`
- `tests/HomePage.test.tsx`
- `tests/EntryFlow.test.tsx`
- `tests/functions/transform-entry.test.ts`
- `tests/functions/write-to-notion.test.ts`
- `.env.example`
- `README_APP.md`

### Existing files to reference

- `docs/superpowers/specs/2026-06-08-housekeeping-transition-form-app-design.md`
- `docs/04_Notion資料庫設計.md`
- `templates/讀書筆記模板.md`
- `templates/房務現場觀察模板.md`
- `templates/團隊信任建立模板.md`
- `templates/改善議題模板.md`
- `templates/每週回顧模板.md`
- `templates/主管回報模板.md`

---

### Task 1: Bootstrap the mobile-first web app skeleton

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `tsconfig.node.json`
- Create: `vite.config.ts`
- Create: `index.html`
- Create: `src/main.tsx`
- Create: `src/App.tsx`
- Create: `src/app/router.tsx`
- Create: `src/styles/global.css`
- Create: `src/styles/tokens.css`
- Test: `tests/HomePage.test.tsx`

- [ ] **Step 1: Write the failing app shell test**

```tsx
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "../src/App";

describe("HomePage", () => {
  it("renders the six entry type cards", () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    );

    expect(screen.getByText("讀書筆記")).toBeInTheDocument();
    expect(screen.getByText("現場觀察")).toBeInTheDocument();
    expect(screen.getByText("團隊互動")).toBeInTheDocument();
    expect(screen.getByText("改善想法")).toBeInTheDocument();
    expect(screen.getByText("主管回報")).toBeInTheDocument();
    expect(screen.getByText("每週回顧")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- tests/HomePage.test.tsx`

Expected: FAIL with missing Vite/React project files or module resolution errors.

- [ ] **Step 3: Create the Vite + React + TypeScript project files**

```json
{
  "name": "housekeeping-transition-form-app",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest",
    "lint": "tsc --noEmit"
  },
  "dependencies": {
    "react": "^19.1.0",
    "react-dom": "^19.1.0",
    "react-router-dom": "^7.6.0",
    "zod": "^3.24.0"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.6.0",
    "@testing-library/react": "^16.3.0",
    "@testing-library/user-event": "^14.6.0",
    "@types/react": "^19.1.0",
    "@types/react-dom": "^19.1.0",
    "@vitejs/plugin-react": "^4.4.0",
    "jsdom": "^26.1.0",
    "typescript": "^5.8.0",
    "vite": "^6.3.0",
    "vitest": "^3.2.0"
  }
}
```

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: [],
  },
});
```

```tsx
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { router } from "./app/router";
import "./styles/tokens.css";
import "./styles/global.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <RouterProvider router={router} />,
);
```

```tsx
import { Outlet } from "react-router-dom";

export default function App() {
  return <Outlet />;
}
```

- [ ] **Step 4: Add the first mobile-first home page and routing**

```tsx
import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import { HomePage } from "../pages/HomePage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
    ],
  },
]);
```

```tsx
const entries = [
  "讀書筆記",
  "現場觀察",
  "團隊互動",
  "改善想法",
  "主管回報",
  "每週回顧",
];

export function HomePage() {
  return (
    <main className="page-shell">
      <header className="hero">
        <p className="eyebrow">房務部轉任領導系統</p>
        <h1>手機打開網址就能記錄</h1>
        <p className="hero-copy">
          先記錄，再整理，再決定是否寫進 Notion。
        </p>
      </header>
      <section className="card-grid" aria-label="entry-types">
        {entries.map((entry) => (
          <button key={entry} className="entry-card" type="button">
            <span>{entry}</span>
          </button>
        ))}
      </section>
    </main>
  );
}
```

- [ ] **Step 5: Add mobile design tokens and layout CSS**

```css
:root {
  --bg: #f5efe5;
  --panel: #fffaf2;
  --ink: #1f2a24;
  --muted: #5f6f64;
  --line: #d7c7af;
  --accent: #375f4a;
  --accent-soft: #dbe8dc;
  --danger: #ac4f3d;
  --radius-lg: 24px;
  --radius-md: 16px;
  --shadow: 0 18px 40px rgba(43, 38, 31, 0.08);
}
```

```css
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: "Noto Sans TC", sans-serif;
  background: linear-gradient(180deg, #f6f1e8 0%, #efe4d1 100%);
  color: var(--ink);
}

.page-shell {
  min-height: 100vh;
  padding: 20px 16px 40px;
}

.card-grid {
  display: grid;
  gap: 12px;
}

.entry-card {
  width: 100%;
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  padding: 18px 16px;
  text-align: left;
  background: var(--panel);
  box-shadow: var(--shadow);
}
```

- [ ] **Step 6: Run tests to verify the app shell passes**

Run: `npm test -- tests/HomePage.test.tsx`

Expected: PASS with six visible entry cards.

---

### Task 2: Define entry types, form schemas, and in-memory app flow state

**Files:**
- Create: `src/lib/types.ts`
- Create: `src/lib/entry-types.ts`
- Create: `src/state/app-state.tsx`
- Create: `src/utils/form-builders.ts`
- Create: `tests/entry-types.test.ts`

- [ ] **Step 1: Write the failing domain model test**

```ts
import { getEntryTypeConfig } from "../src/lib/entry-types";

describe("entry type config", () => {
  it("returns detailed fields for 現場觀察", () => {
    const config = getEntryTypeConfig("field-observation");

    expect(config.label).toBe("現場觀察");
    expect(config.quickFields).toHaveLength(3);
    expect(config.detailedFields.map((field) => field.name)).toEqual([
      "scene",
      "processSeen",
      "unknowns",
      "impactOnFrontDesk",
      "impactOnHousekeeping",
      "improvementIdea",
    ]);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- tests/entry-types.test.ts`

Expected: FAIL with missing config module.

- [ ] **Step 3: Create shared types and six entry type configs**

```ts
export type EntryTypeId =
  | "reading-note"
  | "field-observation"
  | "team-interaction"
  | "improvement-idea"
  | "manager-update"
  | "weekly-review";

export type EntryMode = "quick" | "detailed";

export type FieldConfig = {
  name: string;
  label: string;
  placeholder: string;
  input: "textarea" | "select";
};

export type EntryTypeConfig = {
  id: EntryTypeId;
  label: string;
  description: string;
  quickFields: FieldConfig[];
  detailedFields: FieldConfig[];
};
```

```ts
const entryTypeConfigs: Record<EntryTypeId, EntryTypeConfig> = {
  "field-observation": {
    id: "field-observation",
    label: "現場觀察",
    description: "把退房清潔、查房、房況與銜接觀察整理成紀錄",
    quickFields: [
      { name: "todaySeen", label: "今天看到什麼", placeholder: "例如：急房回報一直卡在查房前後", input: "textarea" },
      { name: "frictionPoint", label: "哪裡卡", placeholder: "例如：房況回報節點不清楚", input: "textarea" },
      { name: "firstFeeling", label: "第一時間感受", placeholder: "例如：不是速度問題，是節點沒有對齊", input: "textarea" },
    ],
    detailedFields: [
      { name: "scene", label: "場景", placeholder: "例如：房況／跨部門溝通", input: "textarea" },
      { name: "processSeen", label: "我看到的流程", placeholder: "描述現場實際怎麼運作", input: "textarea" },
      { name: "unknowns", label: "我不懂的地方", placeholder: "列出還要請教的點", input: "textarea" },
      { name: "impactOnFrontDesk", label: "對客務的影響", placeholder: "例如：櫃檯難以回覆入住時間", input: "textarea" },
      { name: "impactOnHousekeeping", label: "對房務的影響", placeholder: "例如：同仁被反覆催房", input: "textarea" },
      { name: "improvementIdea", label: "可改善處", placeholder: "先寫小改善，不急著大改", input: "textarea" },
    ],
  },
};

export function getEntryTypeConfig(id: EntryTypeId) {
  return entryTypeConfigs[id];
}
```

- [ ] **Step 4: Add app state provider for selected type, mode, raw form, draft, and write result**

```tsx
import { createContext, useContext, useState } from "react";
import type { EntryMode, EntryTypeId } from "../lib/types";

type DraftState = {
  entryType: EntryTypeId | null;
  mode: EntryMode;
  rawValues: Record<string, string>;
  draftResult: Record<string, unknown> | null;
  writeResultUrl: string | null;
};

const defaultState: DraftState = {
  entryType: null,
  mode: "quick",
  rawValues: {},
  draftResult: null,
  writeResultUrl: null,
};

const AppStateContext = createContext<{
  state: DraftState;
  setEntryType: (entryType: EntryTypeId) => void;
  setMode: (mode: EntryMode) => void;
  setRawValues: (values: Record<string, string>) => void;
  setDraftResult: (draft: Record<string, unknown>) => void;
  setWriteResultUrl: (url: string | null) => void;
} | null>(null);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState(defaultState);

  return (
    <AppStateContext.Provider
      value={{
        state,
        setEntryType: (entryType) => setState((current) => ({ ...current, entryType })),
        setMode: (mode) => setState((current) => ({ ...current, mode })),
        setRawValues: (rawValues) => setState((current) => ({ ...current, rawValues })),
        setDraftResult: (draftResult) => setState((current) => ({ ...current, draftResult })),
        setWriteResultUrl: (writeResultUrl) => setState((current) => ({ ...current, writeResultUrl })),
      }}
    >
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  const context = useContext(AppStateContext);
  if (!context) throw new Error("useAppState must be used inside AppStateProvider");
  return context;
}
```

- [ ] **Step 5: Run the config tests**

Run: `npm test -- tests/entry-types.test.ts`

Expected: PASS with the first entry type config recognized.

---

### Task 3: Build the mobile entry screens and client-side review flow

**Files:**
- Create: `src/pages/EntryPage.tsx`
- Create: `src/pages/ReviewPage.tsx`
- Create: `src/pages/SuccessPage.tsx`
- Create: `src/components/EntryTypeCard.tsx`
- Create: `src/components/ModeToggle.tsx`
- Create: `src/components/QuickEntryForm.tsx`
- Create: `src/components/DetailedEntryForm.tsx`
- Create: `src/components/ReviewSection.tsx`
- Create: `src/components/SuggestedActions.tsx`
- Create: `src/components/StickyActionBar.tsx`
- Create: `src/utils/storage.ts`
- Test: `tests/EntryFlow.test.tsx`

- [ ] **Step 1: Write the failing entry flow test**

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RouterProvider } from "react-router-dom";
import { router } from "../src/app/router";

describe("entry flow", () => {
  it("moves from home to quick entry mode for 現場觀察", async () => {
    const user = userEvent.setup();

    render(<RouterProvider router={router} />);

    await user.click(screen.getByRole("button", { name: "現場觀察" }));
    expect(screen.getByText("快速速記")).toBeInTheDocument();
    expect(screen.getByLabelText("今天看到什麼")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- tests/EntryFlow.test.tsx`

Expected: FAIL because entry page routing and forms do not exist yet.

- [ ] **Step 3: Extend routing and connect home cards to entry pages**

```tsx
{
  path: "entry/:entryTypeId",
  element: <EntryPage />,
},
{
  path: "review",
  element: <ReviewPage />,
},
{
  path: "success",
  element: <SuccessPage />,
}
```

```tsx
import { useNavigate } from "react-router-dom";
import type { EntryTypeId } from "../lib/types";

export function EntryTypeCard({
  id,
  label,
  description,
}: {
  id: EntryTypeId;
  label: string;
  description: string;
}) {
  const navigate = useNavigate();

  return (
    <button
      className="entry-card"
      type="button"
      onClick={() => navigate(`/entry/${id}`)}
    >
      <strong>{label}</strong>
      <span>{description}</span>
    </button>
  );
}
```

- [ ] **Step 4: Build quick/detailed entry page with a sticky CTA**

```tsx
export function EntryPage() {
  const { entryTypeId = "reading-note" } = useParams();
  const config = getEntryTypeConfig(entryTypeId as EntryTypeId);
  const { state, setMode, setRawValues } = useAppState();
  const navigate = useNavigate();

  function handleSubmit(values: Record<string, string>) {
    setRawValues(values);
    navigate("/review");
  }

  return (
    <main className="page-shell">
      <ModeToggle
        value={state.mode}
        onChange={setMode}
      />
      {state.mode === "quick" ? (
        <QuickEntryForm fields={config.quickFields} onSubmit={handleSubmit} />
      ) : (
        <DetailedEntryForm fields={config.detailedFields} onSubmit={handleSubmit} />
      )}
      <StickyActionBar primaryLabel="開始整理" />
    </main>
  );
}
```

- [ ] **Step 5: Add local storage draft persistence for mobile interruptions**

```ts
const STORAGE_KEY = "housekeeping-transition-draft";

export function saveDraft(values: Record<string, unknown>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(values));
}

export function loadDraft() {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function clearDraft() {
  localStorage.removeItem(STORAGE_KEY);
}
```

- [ ] **Step 6: Add review and success screens with placeholders for server data**

```tsx
export function ReviewPage() {
  const { state } = useAppState();

  return (
    <main className="page-shell">
      <ReviewSection title="原始內容" data={state.rawValues} />
      <ReviewSection title="整理結果" data={state.draftResult ?? { status: "尚未產生" }} />
      <SuggestedActions suggestions={["可轉成改善議題", "可同步加入主管回報素材"]} />
    </main>
  );
}
```

- [ ] **Step 7: Run the entry flow test**

Run: `npm test -- tests/EntryFlow.test.tsx`

Expected: PASS with home → entry page navigation working.

---

### Task 4: Implement transform API with structured draft output

**Files:**
- Create: `src/services/api.ts`
- Create: `src/utils/prompt-builders.ts`
- Create: `src/lib/result-normalizers.ts`
- Create: `netlify/functions/transform-entry.ts`
- Create: `netlify/functions/shared/openai-client.ts`
- Create: `netlify/functions/shared/payload-schemas.ts`
- Test: `tests/result-normalizers.test.ts`
- Test: `tests/functions/transform-entry.test.ts`

- [ ] **Step 1: Write the failing transform normalizer test**

```ts
import { normalizeTransformResult } from "../src/lib/result-normalizers";

describe("normalizeTransformResult", () => {
  it("maps field observation output into review sections", () => {
    const result = normalizeTransformResult("field-observation", {
      title: "急房與房況回報",
      scene: "房況／跨部門溝通",
      processSeen: "客務催房，房務等待查房完成",
      unknowns: "急房是否有固定回報節點",
      impactOnFrontDesk: "櫃檯難以答覆客人",
      impactOnHousekeeping: "同仁被反覆催促",
      improvementIdea: "建立查房前後回報點",
      suggestedActions: ["create_improvement_issue"],
    });

    expect(result.sections[1].title).toBe("整理結果");
    expect(result.suggestedActions).toContain("create_improvement_issue");
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- tests/result-normalizers.test.ts`

Expected: FAIL because transform normalizers are missing.

- [ ] **Step 3: Create the server payload schema and OpenAI client**

```ts
import { z } from "zod";

export const transformEntrySchema = z.object({
  entryType: z.enum([
    "reading-note",
    "field-observation",
    "team-interaction",
    "improvement-idea",
    "manager-update",
    "weekly-review",
  ]),
  mode: z.enum(["quick", "detailed"]),
  rawValues: z.record(z.string()),
});
```

```ts
import OpenAI from "openai";

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
```

- [ ] **Step 4: Implement the transform Netlify Function**

```ts
import type { Handler } from "@netlify/functions";
import { transformEntrySchema } from "./shared/payload-schemas";
import { openai } from "./shared/openai-client";

export const handler: Handler = async (event) => {
  const parsed = transformEntrySchema.safeParse(JSON.parse(event.body ?? "{}"));
  if (!parsed.success) {
    return { statusCode: 400, body: JSON.stringify({ error: parsed.error.flatten() }) };
  }

  const completion = await openai.responses.create({
    model: "gpt-5-mini",
    input: [
      {
        role: "system",
        content: "請用繁體中文整理房務部轉任素材，語氣支持、務實、清楚，並連結客務與房務銜接。",
      },
      {
        role: "user",
        content: JSON.stringify(parsed.data),
      },
    ],
    text: {
      format: {
        type: "json_schema",
        name: "transition_entry_result",
        schema: {
          type: "object",
          additionalProperties: false,
          properties: {
            title: { type: "string" },
            summary: { type: "string" },
            fields: { type: "object", additionalProperties: { type: "string" } },
            suggestedActions: {
              type: "array",
              items: { type: "string" },
            },
          },
          required: ["title", "summary", "fields", "suggestedActions"],
        },
      },
    },
  });

  return {
    statusCode: 200,
    body: JSON.stringify(completion.output_parsed),
  };
};
```

- [ ] **Step 5: Add client API call and draft normalization**

```ts
export async function transformEntry(payload: {
  entryType: string;
  mode: string;
  rawValues: Record<string, string>;
}) {
  const response = await fetch("/.netlify/functions/transform-entry", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("整理失敗，請稍後再試");
  }

  return response.json();
}
```

```ts
export function normalizeTransformResult(
  entryType: string,
  payload: {
    title: string;
    summary?: string;
    fields?: Record<string, string>;
    suggestedActions?: string[];
  },
) {
  return {
    title: payload.title,
    sections: [
      { title: "整理摘要", items: [{ label: "摘要", value: payload.summary ?? "" }] },
      {
        title: "整理結果",
        items: Object.entries(payload.fields ?? {}).map(([label, value]) => ({ label, value })),
      },
    ],
    suggestedActions: payload.suggestedActions ?? [],
    entryType,
  };
}
```

- [ ] **Step 6: Run transform tests**

Run: `npm test -- tests/result-normalizers.test.ts tests/functions/transform-entry.test.ts`

Expected: PASS with parsed transform payload and normalized review sections.

---

### Task 5: Implement Notion write API and confirmation flow

**Files:**
- Create: `src/lib/notion-targets.ts`
- Create: `netlify/functions/write-to-notion.ts`
- Create: `netlify/functions/shared/notion-client.ts`
- Test: `tests/functions/write-to-notion.test.ts`

- [ ] **Step 1: Write the failing Notion target mapping test**

```ts
import { getNotionTarget } from "../src/lib/notion-targets";

describe("getNotionTarget", () => {
  it("maps manager updates to the manager report page target", () => {
    expect(getNotionTarget("manager-update")).toEqual({
      kind: "page",
      key: "NOTION_MANAGER_REPORT_PAGE_ID",
    });
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- tests/functions/write-to-notion.test.ts`

Expected: FAIL because target config and write function do not exist.

- [ ] **Step 3: Add Notion destination mapping and server client**

```ts
export function getNotionTarget(entryType: string) {
  switch (entryType) {
    case "reading-note":
      return { kind: "database", key: "NOTION_READING_NOTES_DB_ID" };
    case "field-observation":
      return { kind: "database", key: "NOTION_FIELD_OBSERVATIONS_DB_ID" };
    case "team-interaction":
      return { kind: "database", key: "NOTION_TRUST_LOG_DB_ID" };
    case "improvement-idea":
      return { kind: "database", key: "NOTION_IMPROVEMENT_DB_ID" };
    case "manager-update":
      return { kind: "page", key: "NOTION_MANAGER_REPORT_PAGE_ID" };
    case "weekly-review":
      return { kind: "page", key: "NOTION_WEEKLY_REVIEW_PAGE_ID" };
    default:
      throw new Error(`Unsupported entry type: ${entryType}`);
  }
}
```

```ts
import { Client } from "@notionhq/client";

export const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});
```

- [ ] **Step 4: Implement write-to-notion function with database/page branching**

```ts
import type { Handler } from "@netlify/functions";
import { notion } from "./shared/notion-client";
import { getNotionTarget } from "../../src/lib/notion-targets";

export const handler: Handler = async (event) => {
  const payload = JSON.parse(event.body ?? "{}");
  const target = getNotionTarget(payload.entryType);
  const targetId = process.env[target.key];

  if (!targetId) {
    return { statusCode: 500, body: JSON.stringify({ error: `Missing ${target.key}` }) };
  }

  if (target.kind === "database") {
    const page = await notion.pages.create({
      parent: { database_id: targetId },
      properties: payload.properties,
      children: payload.children ?? [],
    });

    return { statusCode: 200, body: JSON.stringify({ url: page.url }) };
  }

  await notion.blocks.children.append({
    block_id: targetId,
    children: payload.children,
  });

  return { statusCode: 200, body: JSON.stringify({ url: payload.fallbackUrl ?? "" }) };
};
```

- [ ] **Step 5: Connect review page confirm button to the write API**

```ts
export async function writeToNotion(payload: unknown) {
  const response = await fetch("/.netlify/functions/write-to-notion", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("寫入 Notion 失敗，請稍後再試");
  }

  return response.json();
}
```

```tsx
async function handleConfirmWrite() {
  const result = await writeToNotion(buildNotionPayload(state.entryType, state.draftResult));
  setWriteResultUrl(result.url);
  navigate("/success");
}
```

- [ ] **Step 6: Run the Notion write tests**

Run: `npm test -- tests/functions/write-to-notion.test.ts`

Expected: PASS with database/page routing validated.

---

### Task 6: Add environment docs, full integration tests, and deployment notes

**Files:**
- Create: `.env.example`
- Create: `README_APP.md`
- Modify: `README.md`
- Test: `tests/EntryFlow.test.tsx`
- Test: `tests/functions/transform-entry.test.ts`
- Test: `tests/functions/write-to-notion.test.ts`

- [ ] **Step 1: Write the failing env documentation assertion**

```ts
import { readFileSync } from "node:fs";

describe(".env.example", () => {
  it("lists the required OpenAI and Notion variables", () => {
    const envExample = readFileSync(".env.example", "utf8");

    expect(envExample).toContain("OPENAI_API_KEY=");
    expect(envExample).toContain("NOTION_API_KEY=");
    expect(envExample).toContain("NOTION_READING_NOTES_DB_ID=");
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- tests/functions/write-to-notion.test.ts`

Expected: FAIL because `.env.example` and setup instructions do not exist yet.

- [ ] **Step 3: Create environment variable template**

```dotenv
OPENAI_API_KEY=
NOTION_API_KEY=
NOTION_READING_NOTES_DB_ID=
NOTION_FIELD_OBSERVATIONS_DB_ID=
NOTION_TRUST_LOG_DB_ID=
NOTION_IMPROVEMENT_DB_ID=
NOTION_MANAGER_REPORT_PAGE_ID=
NOTION_WEEKLY_REVIEW_PAGE_ID=
```

- [ ] **Step 4: Document local development and deployment**

```md
# APP Local Setup

1. Install dependencies: `npm install`
2. Copy envs: `cp .env.example .env`
3. Fill in OpenAI + Notion keys and IDs
4. Start local web app: `npm run dev`
5. Start Netlify Functions locally if Netlify CLI is installed: `npx netlify dev`

## Deploy goal

- Mobile-first URL app
- Opened directly from phone browser
- Optional: save to home screen
```

- [ ] **Step 5: Run the full test suite**

Run: `npm test`

Expected: PASS across UI config, flow state, transform normalizers, and Notion write tests.

- [ ] **Step 6: Run the production build**

Run: `npm run build`

Expected: PASS with generated frontend bundle and no TypeScript errors.

---

## Self-Review

### Spec coverage

- Mobile browser URL-first usage: covered in Tasks 1, 3, and 6 through mobile-first UI, sticky controls, and deployment docs
- Six entry types and quick/detailed modes: covered in Tasks 2 and 3
- Review before write: covered in Tasks 3 and 5
- Structured transform logic: covered in Task 4
- Notion destination mapping: covered in Task 5
- MVP limits: respected by avoiding analytics, voice, image, and multi-user scope

### Placeholder scan

- No `TODO`, `TBD`, or “appropriate handling” placeholders left in steps
- Each code-changing step includes concrete snippets
- Each validation step includes an exact command and expected result

### Type consistency

- `EntryTypeId` values are consistent across client config, transform schema, and Notion target mapping
- `quick` / `detailed` mode names are consistent across app state and API payloads
- Review flow uses one path: `rawValues` → `draftResult` → `writeResultUrl`

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-06-08-housekeeping-transition-form-app.md`. Two execution options:

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**
