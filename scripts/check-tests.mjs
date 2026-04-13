#!/usr/bin/env node
// Shared rule: "a feature file must ship with a matching test file".
// Called from:
//   - .claude/hooks/require-tests.sh  (one file at a time, via Claude PostToolUse)
//   - .husky/pre-commit               (many files, all staged changes)
//
// Exit codes:
//   0 -> all good
//   1 -> one or more feature files lack a matching test file
//
// Usage:
//   node scripts/check-tests.mjs <file1> [file2 ...]
// Flags:
//   --staged   use git-staged files instead of positional args
//   --quiet    suppress the OK line when passing

import { readFileSync, existsSync } from "node:fs";
import { execSync } from "node:child_process";
import { resolve, relative, extname, basename, dirname, join } from "node:path";

const ROOT = process.cwd();

// Paths that NEVER require a test (no behavior worth testing, or owned elsewhere).
const HARD_EXCLUDE = [
  /(^|\/)\.next\//,
  /(^|\/)node_modules\//,
  /(^|\/)dist\//,
  /(^|\/)coverage\//,
  /(^|\/)playwright-report\//,
  /(^|\/)test-results\//,
  // Legacy trees scheduled for deletion:
  /^frontend\//,
  /^backend\//,
  // Test files themselves, config files, type-only files:
  /\.(test|spec)\.(ts|tsx|js|jsx)$/,
  /\.d\.ts$/,
  /\.config\.(ts|js|mjs|cjs)$/,
  /(^|\/)vitest\.setup\.ts$/,
  // Next.js structural files that are pure JSX shells:
  /(^|\/)layout\.tsx$/,
  /(^|\/)not-found\.tsx$/,
  /(^|\/)loading\.tsx$/,
  /(^|\/)error\.tsx$/,
  /(^|\/)globals\.css$/,
  /\.(css|scss|sass|md|mdx|json|yml|yaml|png|jpg|jpeg|svg|ico|webp)$/,
  // E2E specs have their own enforcement path:
  /^e2e\//,
  // Generated:
  /^next-env\.d\.ts$/,
  // Skill/docs/hook infra:
  /^\.claude\//,
  /^\.codex\//,
  /^\.agents\//,
  /^\.husky\//,
  /^skills\//,
  /^scripts\//,
  /^public\//,
];

// Only files matching one of these patterns are considered "feature files".
const FEATURE_PATTERNS = [
  /^src\/app\/.*\/page\.tsx$/,
  /^src\/app\/api\/.*\/route\.ts$/,
  /^src\/components\/.*\.tsx?$/,
  /^src\/lib\/.*\.tsx?$/,
  /^src\/hooks\/.*\.tsx?$/,
  /^src\/server\/.*\.tsx?$/,
];

function loadTestIgnore() {
  const p = resolve(ROOT, ".testignore");
  if (!existsSync(p)) return [];
  return readFileSync(p, "utf8")
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#"));
}

function isIgnored(relPath, testIgnore) {
  for (const re of HARD_EXCLUDE) {
    if (re.test(relPath)) return true;
  }
  // testignore entries match either exact path or directory prefix.
  for (const entry of testIgnore) {
    if (relPath === entry) return true;
    if (entry.endsWith("/") && relPath.startsWith(entry)) return true;
  }
  return false;
}

function isFeatureFile(relPath) {
  return FEATURE_PATTERNS.some((re) => re.test(relPath));
}

// Map a feature file to the expected test file path.
function expectedTestFor(relPath) {
  const ext = extname(relPath);
  const withoutExt = relPath.slice(0, -ext.length);
  return `${withoutExt}.test${ext}`;
}

function testExists(relPath, candidateSet) {
  const abs = resolve(ROOT, relPath);
  if (existsSync(abs)) return true;
  // Also accept it as "present" if it's in the candidate set
  // (e.g. also staged in the same commit).
  return candidateSet.has(relPath);
}

function getStagedFiles() {
  try {
    const out = execSync(
      "git diff --cached --name-only --diff-filter=ACMR",
      { encoding: "utf8" }
    );
    return out
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
  } catch {
    return [];
  }
}

function normalize(p) {
  const r = relative(ROOT, resolve(ROOT, p));
  // Always use forward slashes for matching.
  return r.split("\\").join("/");
}

function main() {
  const args = process.argv.slice(2);
  const flags = new Set(args.filter((a) => a.startsWith("--")));
  let files = args.filter((a) => !a.startsWith("--"));

  if (flags.has("--staged") || files.length === 0) {
    files = getStagedFiles();
  }

  const testIgnore = loadTestIgnore();
  const rels = files.map(normalize);
  const candidateSet = new Set(rels); // tests added in the same change count

  const missing = [];
  for (const rel of rels) {
    if (isIgnored(rel, testIgnore)) continue;
    if (!isFeatureFile(rel)) continue;
    const expected = expectedTestFor(rel);
    if (!testExists(expected, candidateSet)) {
      missing.push({ source: rel, expected });
    }
  }

  if (missing.length === 0) {
    if (!flags.has("--quiet")) {
      console.error("[require-tests] OK — all touched feature files have tests.");
    }
    process.exit(0);
  }

  console.error("");
  console.error("✖ require-tests: feature files changed without matching tests.");
  console.error("");
  for (const { source, expected } of missing) {
    console.error(`  Edited : ${source}`);
    console.error(`  Expect : ${expected}`);
    console.error("");
  }
  console.error(
    "Add the tests in this same change (see skill: test-discipline)."
  );
  console.error(
    "Grandfathered exceptions live in .testignore. Bypass (humans only): git commit --no-verify"
  );
  process.exit(1);
}

main();
