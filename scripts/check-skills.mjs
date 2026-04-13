#!/usr/bin/env node
/**
 * check-skills.mjs — drift check + bootstrap helper for the Vercel skills CLI.
 *
 * Modes:
 *   node scripts/check-skills.mjs              → fail if targets drift from skills-lock.json
 *   node scripts/check-skills.mjs --bootstrap  → silently materialize targets (postinstall)
 *
 * The source of truth is `skills/` + `skills-lock.json`. Targets are
 * `.claude/skills/` (Claude Code) and `.agents/skills/` (Codex, Cursor,
 * Antigravity). We delegate materialization to `skills experimental_install`.
 */
import { execSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";

const ROOT = resolve(new URL("..", import.meta.url).pathname);
const LOCK = join(ROOT, "skills-lock.json");
const SRC = join(ROOT, "skills");
const TARGETS = [
  join(ROOT, ".claude", "skills"),
  join(ROOT, ".agents", "skills"),
];

const isBootstrap = process.argv.includes("--bootstrap");

function run(cmd) {
  return execSync(cmd, { cwd: ROOT, stdio: "pipe" }).toString();
}

function fail(msg) {
  console.error(`check-skills: ${msg}`);
  process.exit(1);
}

if (!existsSync(LOCK)) {
  if (isBootstrap) process.exit(0); // nothing to do on fresh clone w/o lockfile
  fail("skills-lock.json missing — run `pnpm skills:add ./skills/<name> -a '*'` to create it");
}

if (!existsSync(SRC)) {
  if (isBootstrap) process.exit(0);
  fail("skills/ directory missing");
}

// Materialize targets from the lockfile. Idempotent.
try {
  run("pnpm exec skills experimental_install -y");
} catch (err) {
  if (isBootstrap) process.exit(0);
  fail(`skills experimental_install failed:\n${err.stdout?.toString() ?? ""}${err.stderr?.toString() ?? ""}`);
}

if (isBootstrap) process.exit(0);

// Drift check: every dir name in skills/ must appear in each target.
const sourceSkills = readdirSync(SRC).filter((n) =>
  statSync(join(SRC, n)).isDirectory()
);

const lock = JSON.parse(readFileSync(LOCK, "utf8"));
const lockNames = new Set(
  (lock.skills ?? []).map((s) => s.name ?? s).filter(Boolean)
);

const missingInLock = sourceSkills.filter((n) => !lockNames.has(n));
if (missingInLock.length) {
  fail(
    `skills/ has entries not tracked in skills-lock.json: ${missingInLock.join(", ")}.\n` +
      `Run: pnpm skills:add ./skills/<name> -a '*' for each, then commit the lockfile.`
  );
}

for (const target of TARGETS) {
  if (!existsSync(target)) {
    fail(`${target} not materialized — expected after experimental_install`);
  }
  const present = new Set(readdirSync(target));
  const missing = sourceSkills.filter((n) => !present.has(n));
  if (missing.length) {
    fail(`${target} missing skills: ${missing.join(", ")}`);
  }
}

console.log(`skills: OK (${sourceSkills.length} skills in sync across targets)`);
