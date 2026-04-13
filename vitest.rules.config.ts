// Separate Vitest config for Firestore security-rules tests. Runs in a Node
// environment (no jsdom) because the rules client talks to the emulator
// directly and does not need a DOM.
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    include: ["firestore.rules.test.ts", "tests/rules/**/*.test.ts"],
    testTimeout: 20_000,
  },
});
