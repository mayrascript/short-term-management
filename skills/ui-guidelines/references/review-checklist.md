# Review Checklist

Use this checklist for any UI feature or UI iteration.

## Visual consistency

- Does the view reuse existing colors, surfaces, borders, and spacing?
- Are there hardcoded visual values that should be tokens or existing classes?
- Does the feature align with the current dashboard shell and page rhythm?

## View structure

- Does the view start with a clear page header?
- Is the main content organized using existing primitives like cards and grids?
- If the view is CRUD, does it follow the CRUD structure from `view-patterns.md`?

## States

- Is `loading` explicitly handled?
- Is `empty` explicitly handled?
- Is `error` visible in the UI, not just logged?
- Is `success` visible where users need confirmation?

## Reuse

- Is an existing project component or `shadcn` component being ignored unnecessarily?
- If a pattern repeats, was it extracted or at least documented?
- If a new reusable component exists, was `component-catalog.md` updated?

## Documentation maintenance

- Did the feature introduce a new pattern, variant, or component?
- If yes, did the skill documentation get updated in the same task?

## Script

- Run:

```bash
npm run ui:check
```
