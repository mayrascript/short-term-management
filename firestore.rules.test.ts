import { readFileSync } from "node:fs";
import {
  initializeTestEnvironment,
  assertSucceeds,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { afterAll, beforeAll, beforeEach, describe, it } from "vitest";

// Seed baseline coverage. Extend this file as soon as the rules get tightened
// (see firestore.rules: the current "allow read, write: if true" is a stub and
// MUST be replaced — when that happens, this file should gain deny cases).

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

describe("firestore.rules — baseline (stub rules: allow all)", () => {
  it("anyone can read any document while rules are open", async () => {
    await env.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), "tasks/t1"), { title: "Paint" });
    });
    const anon = env.unauthenticatedContext().firestore();
    await assertSucceeds(getDoc(doc(anon, "tasks/t1")));
  });

  it("anyone can write any document while rules are open", async () => {
    const anon = env.unauthenticatedContext().firestore();
    await assertSucceeds(setDoc(doc(anon, "tasks/t2"), { title: "Hack" }));
  });
});

// When you tighten firestore.rules, add suites like this:
//
// describe("firestore.rules: tasks (authed only)", () => {
//   it("denies unauthenticated reads", async () => {
//     const anon = env.unauthenticatedContext().firestore();
//     await assertFails(getDoc(doc(anon, "tasks/t1")));
//   });
//   it("allows authenticated reads", async () => {
//     const alice = env.authenticatedContext("alice").firestore();
//     await env.withSecurityRulesDisabled(async (ctx) => {
//       await setDoc(doc(ctx.firestore(), "tasks/t1"), { title: "Paint" });
//     });
//     await assertSucceeds(getDoc(doc(alice, "tasks/t1")));
//   });
// });
