---
name: ui-guidelines
description: Apply and maintain the project's UI guidelines for any UI feature or iteration. Use when creating or changing views, CRUD screens, reusable components, layout patterns, visual states, or dashboard UI. This skill standardizes the current hybrid system based on globals.css, project layout patterns, and shadcn adoption, and it must update its own documentation when a new UI pattern or component is introduced.
---

# UI Guidelines

This skill is the source of truth for the project's UI rules.

Use it whenever work touches:

- pages in `src/app`
- reusable UI in `src/components`
- layout structure
- CRUD screens
- form composition
- empty/loading/error/success states
- new visual patterns or new components

## What this skill controls

This repository uses a hybrid UI system:

- project tokens and layout primitives from `src/app/globals.css`
- project-specific shell and page structure from `src/components/dashboard-shell.tsx`
- progressive adoption of `shadcn` components from `src/components/ui`

Do not invent a parallel design system.

## Required workflow for any UI feature

1. Read:
   - `references/design-tokens.md`
   - `references/layout-spacing.md`
   - `references/view-patterns.md`
   - `references/component-catalog.md`
2. Implement or iterate the view/component using the existing system first.
3. Confirm the feature covers the required UI states:
   - `loading`
   - `empty`
   - `error`
   - `success`
4. Detect whether the feature introduces a new:
   - reusable component
   - view pattern
   - CRUD variant
   - state presentation pattern
   - visual rule not yet documented
5. If the guideline is incomplete, follow `references/decision-rules.md`:
   - propose the missing rule from the current system
   - update the skill documentation
   - add the component or pattern entry to the correct reference file
6. Run the repo checker:

```bash
npm run ui:check
```

Or directly:

```bash
./scripts/check-ui-guidelines.sh
```

## Non-negotiable rules

- Reuse existing tokens before adding raw colors, custom radii, or arbitrary spacing.
- Prefer existing project patterns before inventing a new layout.
- Prefer reusable components when a pattern repeats.
- Every CRUD view must follow the CRUD view pattern in `references/view-patterns.md`.
- Every main view must define `loading`, `empty`, `error`, and `success`.
- If a component or pattern is new, the skill documentation must be updated in the same task.
- Missing guideline documentation for new patterns/components is a workflow failure.

## Notes on legacy

This skill is based on what the project already uses today. It does not require a total rewrite of legacy UI before new work can happen.

However:

- new work should move toward the documented system
- repeated patterns should be normalized
- undocumented new patterns should not accumulate

## References

- Tokens and colors: `references/design-tokens.md`
- Layout, spacing, and page primitives: `references/layout-spacing.md`
- View and CRUD patterns plus UI states: `references/view-patterns.md`
- Component catalog: `references/component-catalog.md`
- Review checklist: `references/review-checklist.md`
- Rules for documenting new patterns: `references/decision-rules.md`
- Script wrapper: `scripts/check-ui-guidelines.sh`
