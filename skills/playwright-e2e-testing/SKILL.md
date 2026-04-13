---
name: playwright-e2e-testing
description: "Write Playwright e2e tests for critical user-facing flows (auth, CRUD per feature area). Use only for happy-path regression protection, not for UI unit behavior."
user_invocable: false
---

# Playwright E2E Testing

Use this skill when you ship a **new user-facing flow** or change behavior on an existing critical flow. Examples:

- Creating or editing an expense in `/finance`
- Reserving a guest in `/guests`
- Marking a task complete in `/tasks`
- Login / logout when auth lands

**Do NOT** use Playwright for things that belong in a unit test (component rendering, a utility function, a route handler input validation). Use the `vitest-unit-testing` skill there.

Tests live in `e2e/<flow>.spec.ts`. Run with `pnpm test:e2e` (boots `pnpm dev` automatically via `webServer` config). First run needs browsers: `pnpm exec playwright install chromium`.

## Scope rule

One e2e spec per feature area, covering the **happy path and one critical failure case**. Anything else is probably a unit test.

```
e2e/
  tasks.spec.ts       # create, complete, delete one task
  finance.spec.ts     # add an expense, filter by month
  guests.spec.ts      # add a reservation
  smoke.spec.ts       # app loads, nav works
```

## Minimal spec

```ts
// e2e/tasks.spec.ts
import { test, expect } from "@playwright/test";

test("user can create and complete a task", async ({ page }) => {
  await page.goto("/tasks");
  await page.getByRole("button", { name: /add task/i }).click();
  await page.getByLabel(/title/i).fill("Buy paint");
  await page.getByRole("button", { name: /save/i }).click();

  await expect(page.getByText("Buy paint")).toBeVisible();

  await page.getByRole("checkbox", { name: /buy paint/i }).check();
  await expect(page.getByText("Buy paint")).toHaveClass(/completed/);
});
```

## Locator preferences (in order)

1. `getByRole("button", { name: /…/i })` — most stable, accessibility-first.
2. `getByLabel(/…/i)`, `getByPlaceholder(/…/i)` — for form fields.
3. `getByText(/…/i)` — for content assertions only.
4. `data-testid` — last resort; add it to the component if UI is complex.

Do NOT use CSS selectors or `page.locator("div > span:nth-child(2)")`. They break on every refactor.

## Data strategy

Local dev uses production Firestore by default — **do not pollute it**. For e2e:

1. Preferred: point the app at the Firestore emulator (`FIRESTORE_EMULATOR_HOST=127.0.0.1:8080`) in the test env. Seed the emulator at the top of the spec via the Admin SDK or a setup fixture.
2. Fallback: tag test data clearly (prefix with `[e2e]`) and delete it in `test.afterEach`.

## Fixtures

Extract shared setup with `test.extend`:

```ts
import { test as base, expect } from "@playwright/test";

export const test = base.extend<{ loggedInPage: typeof base.page }>({
  loggedInPage: async ({ page }, use) => {
    await page.goto("/login");
    await page.getByLabel(/email/i).fill("e2e@example.com");
    await page.getByLabel(/password/i).fill("e2e-password");
    await page.getByRole("button", { name: /sign in/i }).click();
    await expect(page).toHaveURL(/\//);
    await use(page);
  },
});
```

Use fixtures only when 3+ specs need the same setup. Otherwise inline.

## Flake prevention

- Always use `expect(locator).toBeVisible()` — not `await page.waitForTimeout(500)`.
- Never assert on server-side timing (`Date.now()` in the UI).
- If a spec is flaky twice in a row, fix the product or the locator — don't add retries.

## Checklist

- [ ] One spec per feature area in `e2e/`.
- [ ] Locators are role/label-based.
- [ ] Data is cleaned up or lives in the emulator.
- [ ] `pnpm test:e2e` green locally.
- [ ] No `waitForTimeout`, no `.nth()`, no CSS selectors.
