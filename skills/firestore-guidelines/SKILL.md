---
name: firestore-guidelines
description: Apply and maintain the project's Firestore standards for any feature that creates or changes collections, document shapes, route handlers, queries, security rules, indexes, or TypeScript models. Use this whenever work touches Firestore so code, types, rules, indexes, and Firestore documentation stay consistent.
---

# Firestore Guidelines

This skill is the source of truth for how this repository works with Firestore.

Use it whenever work touches:

- `db.collection(...)`
- Firestore-backed route handlers
- document schema changes
- filters and ordering in queries
- `firestore.rules`
- `firestore.indexes.json`
- `src/lib/types.ts`
- shared Firestore utilities in `src/lib`

## Core objective

A Firestore change is not complete if it only changes application code.

Every Firestore feature must be reviewed across:

- code
- types
- rules
- indexes
- documentation inside this skill

## Required workflow for any Firestore feature

1. Read the relevant references:
   - `references/modeling-conventions.md`
   - `references/collection-lifecycle.md`
   - `references/document-shapes.md`
   - `references/query-write-patterns.md`
   - `references/current-collections.md`
2. Identify whether the feature:
   - creates a collection
   - changes a document shape
   - introduces a new query or filter
   - introduces a new write flow
   - introduces soft-delete
   - requires rules or index review
3. Apply the conventions from this skill.
4. If the feature introduces a pattern not yet documented:
   - define the missing rule based on the current project system
   - update this skill's references in the same task
5. Update all impacted layers:
   - route handlers
   - shared Firestore utilities
   - `src/lib/types.ts`
   - `firestore.rules`
   - `firestore.indexes.json`
   - collection documentation in this skill
6. Run:

```bash
npm run firestore:check
```

Or:

```bash
./scripts/check-firestore-guidelines.sh
```

## Non-negotiable rules

- Collection naming must stay consistent with the project's current style.
- `_id` belongs to the API/frontend serialization layer, not persisted document payload by default.
- `createdAt` and `updatedAt` are mandatory unless there is a very explicit reason otherwise.
- Timestamps must be stored as Firestore `Timestamp` values and serialized to ISO for the frontend.
- New collections or patterns must be documented in this skill in the same feature.
- New query patterns must trigger an index review.
- Security rules must be explicitly reviewed whenever a new collection or access pattern is introduced.

## How this skill relates to installed Firebase skills

Use these installed skills as authoritative Firebase references:

- `firebase-basics`
- `firebase-firestore-standard`
- `firestore-security-rules-auditor`
- `firebase-app-hosting-basics`

This skill does not replace them. It adds the project-specific contract that those generic skills do not know.

## Notes on baseline vs future normalization

This skill uses the current project as a baseline:

- `reservations`
- `posts`
- `tasks`
- `expenses`
- `expenseCategories`

It should preserve compatibility with the current codebase while guiding future features toward a cleaner and more explicit standard.

## References

- Modeling conventions: `references/modeling-conventions.md`
- Collection lifecycle: `references/collection-lifecycle.md`
- Document shapes: `references/document-shapes.md`
- Rules policy: `references/rules-policy.md`
- Index policy: `references/index-policy.md`
- Query and write patterns: `references/query-write-patterns.md`
- Current collection contracts: `references/current-collections.md`
- Decision rules for undocumented patterns: `references/decision-rules.md`
- Review checklist: `references/review-checklist.md`
- Script wrapper: `scripts/check-firestore-guidelines.sh`
