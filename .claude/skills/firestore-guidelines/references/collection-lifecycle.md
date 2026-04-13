# Collection Lifecycle

## When creating a new collection

Complete all of these:

1. Define the collection name and document purpose.
2. Define the document shape.
3. Decide required metadata:
   - `createdAt`
   - `updatedAt`
   - optional `slug`
   - optional soft-delete fields
4. Add or update TypeScript interfaces in `src/lib/types.ts`.
5. Implement route handlers and serialization logic.
6. Review whether `src/lib/serverUtils.ts` needs shared helpers.
7. Review security implications in `firestore.rules`.
8. Review query patterns and `firestore.indexes.json`.
9. Add the collection contract to `current-collections.md`.
10. Run `npm run firestore:check`.

## When modifying an existing collection

Complete all relevant items:

1. Identify whether the change affects:
   - document shape
   - query behavior
   - write behavior
   - serialization
   - rules
   - indexes
2. Update `src/lib/types.ts` if the frontend contract changes.
3. Update route handlers.
4. Update rules if access semantics changed.
5. Update indexes if query structure changed.
6. Update the collection contract in `current-collections.md`.
7. Run `npm run firestore:check`.

## If the feature introduces a new pattern

Examples:

- subcollection strategy
- new soft-delete style
- ownership metadata
- new query family

Then:

- update the relevant reference file
- do not leave the new pattern undocumented
