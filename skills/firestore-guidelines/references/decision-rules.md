# Decision Rules for Missing Firestore Guidelines

When a Firestore feature introduces a pattern not covered by the current standard, do not leave it undocumented.

## Default policy

The skill should:

1. identify the undocumented Firestore pattern
2. define the missing rule from the current project system
3. update this skill's docs by default
4. continue implementation using that documented rule

## What counts as a missing guideline

- a new collection
- a new document shape family
- a new lifecycle metadata pattern
- a new ownership or access pattern
- a new soft-delete convention
- a new query/index family
- a new relationship strategy

## Where to update docs

- collection-specific changes:
  - `current-collections.md`
- naming or field conventions:
  - `modeling-conventions.md`
- lifecycle workflow:
  - `collection-lifecycle.md`
- query or write behavior:
  - `query-write-patterns.md`
- rules behavior:
  - `rules-policy.md`
- index behavior:
  - `index-policy.md`

## When to ask the user

Ask only if the decision is product-defining or incompatible with existing patterns, for example:

- major ownership model changes
- multi-tenant partitioning strategy
- subcollection vs root collection architecture with broad implications

Otherwise, define and document the missing convention by default.

## Verification rule

If a new Firestore pattern or collection appears without documentation updates, the Firestore check should fail.
