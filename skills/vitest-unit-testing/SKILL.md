---
name: vitest-unit-testing
description: "Write Vitest + Testing Library tests for React components, API route handlers, and lib utilities in this Next.js 16 + React 19 + Firestore project. Includes patterns for mocking firebaseAdmin, next/navigation, and RSC pages."
user_invocable: false
---

# Vitest Unit Testing

Use this skill when the feature you're touching falls under:

- `src/components/**/*.tsx` (React components)
- `src/app/**/page.tsx` (RSC pages and `"use client"` pages)
- `src/app/api/**/route.ts` (API route handlers)
- `src/lib/**/*.ts` (utilities, client wrappers)
- `src/hooks/**/*.ts` (custom hooks)

Test files live next to the source with a `.test.ts[x]` extension. Run with `pnpm test` (single pass) or `pnpm test:watch`.

## Imports you will reach for

```ts
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/vitest"; // already loaded via vitest.setup.ts
```

## React components (client components)

Straight Testing Library. Query by role/label, not by class.

```tsx
// src/components/ui/button.test.tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "./button";

describe("Button", () => {
  it("renders its children", () => {
    render(<Button>Save</Button>);
    expect(screen.getByRole("button", { name: /save/i })).toBeInTheDocument();
  });

  it("calls onClick when activated", async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Save</Button>);
    await userEvent.click(screen.getByRole("button", { name: /save/i }));
    expect(onClick).toHaveBeenCalledOnce();
  });
});
```

## React Server Components (pages without `"use client"`)

An RSC is an async function that returns JSX. You can `await` it directly and render the result.

```tsx
import { render, screen } from "@testing-library/react";
import Page from "./page";

it("renders the KPI cards", async () => {
  const ui = await Page(); // RSC: invoke, get JSX
  render(ui);
  expect(screen.getByRole("heading", { name: /dashboard/i })).toBeInTheDocument();
});
```

If the RSC reads from Firestore, mock `@/lib/firebaseAdmin` (see below) before importing the page.

## API route handlers (`src/app/api/**/route.ts`)

Call the exported function with a real `NextRequest`/`Request` and assert on the returned `Response`.

```ts
// src/app/api/tasks/route.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";

// IMPORTANT: mock before the route imports the admin SDK.
vi.mock("@/lib/firebaseAdmin", () => {
  const get = vi.fn().mockResolvedValue({
    docs: [
      { id: "t1", data: () => ({ title: "Buy paint", category: "maintenance", status: "pending" }) },
    ],
  });
  const orderBy = vi.fn().mockReturnValue({ get });
  const add = vi.fn().mockResolvedValue({ id: "new", get: () => Promise.resolve({ id: "new", data: () => ({}) }) });
  const collection = vi.fn().mockReturnValue({ orderBy, add });
  return { db: { collection } };
});

import { GET, POST } from "./route";

describe("api/tasks", () => {
  it("GET returns all tasks", async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveLength(1);
    expect(body[0]).toMatchObject({ title: "Buy paint" });
  });

  it("POST rejects without title", async () => {
    const req = new Request("http://t/api/tasks", {
      method: "POST",
      body: JSON.stringify({}),
      headers: { "content-type": "application/json" },
    });
    // The POST signature takes NextRequest but Request is structurally compatible.
    const res = await POST(req as any);
    expect(res.status).toBe(400);
  });
});
```

## Lib utilities

Plain Vitest.

```ts
// src/lib/clientApi.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { apiRequest } from "./clientApi";

describe("apiRequest", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true }),
    }));
  });

  it("calls the right URL with JSON headers", async () => {
    await apiRequest("/tasks", { method: "POST", body: { title: "x" } });
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/tasks"),
      expect.objectContaining({ method: "POST" })
    );
  });
});
```

## Common mocks

### `@/lib/firebaseAdmin`
Mock the `db.collection(...)` chain. The pattern above (`collection → orderBy → get` and `collection → add → ref.get`) covers most route handlers.

### `next/navigation`
```ts
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn() }),
  usePathname: () => "/test",
  useSearchParams: () => new URLSearchParams(),
}));
```

### `next/headers`
```ts
vi.mock("next/headers", () => ({
  cookies: async () => ({ get: () => undefined }),
  headers: async () => new Headers(),
}));
```

## Checklist before calling done

- [ ] At least one happy-path assertion per exported symbol.
- [ ] At least one branch/error path.
- [ ] No real network calls (`fetch`, `db.*`) without mocking.
- [ ] `pnpm test` green for this file.
- [ ] Test title reads like a spec sentence: `it("returns 400 when title is missing")` not `it("test 1")`.
