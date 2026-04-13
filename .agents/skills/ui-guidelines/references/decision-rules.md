# Decision Rules for Missing Guidelines

When a feature introduces UI that is not clearly covered by the existing guideline, the skill must not stay silent.

## Default policy

The skill should:

1. identify the missing rule or missing documentation
2. propose a definition based on the current project system
3. update the skill documentation by default
4. continue implementation using that documented rule

This repository uses the skill itself as the source of truth.

## What counts as a missing guideline

- a new reusable component
- a new reusable component variant
- a new page composition pattern
- a new CRUD structure
- a new visual state presentation
- a new semantic token or rule

## Where to update docs

- new component or reusable variant:
  - update `component-catalog.md`
- new page or CRUD pattern:
  - update `view-patterns.md`
- new token or visual language rule:
  - update `design-tokens.md` or `layout-spacing.md`
- new review behavior:
  - update `review-checklist.md`

## When to ask the user

Ask only when the decision is truly product-defining or visually ambiguous, such as:

- introducing a wholly new navigation paradigm
- changing the visual brand direction
- choosing between competing patterns with different product implications

Otherwise, define the missing rule from the current system and document it.

## Verification rule

If a feature introduces a new component or pattern and the skill docs were not updated, the UI check should fail.
