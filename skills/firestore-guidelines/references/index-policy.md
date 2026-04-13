# Index Policy

## Required review trigger

Review indexes whenever a query adds or changes:

- `where(...)` filters
- multiple filters
- `orderBy(...)`
- restore/trash semantics
- date range queries

## Current baseline

The repo currently has explicit indexes for:

- `expenses`
  - `isDeleted + date DESC`
  - `isDeleted + date ASC`

## Query-to-index rule

If a new query shape is introduced, do not assume indexes are already covered.

Document:

- collection
- filter fields
- sort fields
- whether the existing index file already supports it

If a new index is needed:

- update `firestore.indexes.json`
- update the collection contract in `current-collections.md`

## Soft-delete reminder

Any collection using `isDeleted` with sorted filtered queries should trigger index review immediately.
