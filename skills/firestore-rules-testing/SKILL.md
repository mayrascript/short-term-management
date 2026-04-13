---
name: firestore-rules-testing
description: "Write and extend tests for firestore.rules using @firebase/rules-unit-testing against the Firestore emulator. Use whenever firestore.rules changes."
user_invocable: false
---

# Firestore Rules Testing

Trigger: **any change to `firestore.rules` must be covered by a test** in `firestore.rules.test.ts`. A rule without a test is a rule that ships broken.

Run with: `pnpm test:rules` (boots the Firestore emulator automatically via `firebase emulators:exec`).

Prereqs (one-time, user does this — not Claude):
- `firebase-tools` is a devDep (already present).
- Java 11+ must be available on `PATH` (required by the Firestore emulator).

## Minimal test skeleton

```ts
// firestore.rules.test.ts
import { readFileSync } from "node:fs";
import {
  initializeTestEnvironment,
  assertSucceeds,
  assertFails,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { afterAll, beforeAll, beforeEach, describe, it } from "vitest";

let env: RulesTestEnvironment;

beforeAll(async () => {
  env = await initializeTestEnvironment({
    projectId: "demo-str",
    firestore: {
      rules: readFileSync("firestore.rules", "utf8"),
      host: "127.0.0.1",
      port: 8080,
    },
  });
});

afterAll(async () => {
  await env?.cleanup();
});

beforeEach(async () => {
  await env.clearFirestore();
});
```

## Authoring rule-level tests

Think in two columns per collection: **allow** cases and **deny** cases. Write at least one of each.

```ts
describe("firestore.rules: tasks", () => {
  it("allows an authenticated user to read tasks", async () => {
    const alice = env.authenticatedContext("alice").firestore();
    // Seed with privileged context (rules disabled) to set up baseline data:
    await env.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), "tasks/t1"), { title: "Paint" });
    });
    await assertSucceeds(getDoc(doc(alice, "tasks/t1")));
  });

  it("denies unauthenticated writes", async () => {
    const anon = env.unauthenticatedContext().firestore();
    await assertFails(setDoc(doc(anon, "tasks/t1"), { title: "Hack" }));
  });
});
```

## Patterns by rule shape

| Rule | Test to add |
|---|---|
| `allow read: if request.auth != null;` | One authed `assertSucceeds(getDoc(...))`, one anon `assertFails(getDoc(...))` |
| `allow write: if request.auth.uid == resource.data.ownerId;` | Owner writes → success. Non-owner writes → fail. Anon writes → fail. |
| `allow create: if request.resource.data.keys().hasAll([...]);` | Valid payload → success. Missing field → fail. Extra field (if forbidden) → fail. |
| `allow update: if !(\"status\" in request.resource.data.diff(resource.data).affectedKeys()) ...` | Update without changing status → success. Update that changes status → fail. |

## When you add a new collection

1. Add allow/deny rules to `firestore.rules`.
2. Add a `describe("firestore.rules: <collection>", ...)` block with at least:
   - One positive case per allowed operation (read, create, update, delete).
   - One negative case per forbidden shape (unauth, wrong owner, wrong schema).
3. Run `pnpm test:rules`.

## Don'ts

- Don't seed with `setDoc` from an authenticated context — that tests both the rule AND the seed in one step. Seed via `env.withSecurityRulesDisabled(...)`.
- Don't skip `await env.clearFirestore()` between tests — leakage causes flaky pass/fail.
- Don't hit the real production project — the emulator uses a `demo-*` project id so cloud resources are never touched.
