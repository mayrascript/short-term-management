# Review Checklist

Use this checklist for any Firestore-related feature.

## Modeling

- Is the collection name consistent with the current project style?
- Are required metadata fields present?
- Is `_id` only exposed at the API layer?
- Are enums and controlled strings typed and documented?

## Code

- Were route handlers updated consistently?
- Are shared conversion helpers reused where possible?
- Is create/update/read serialization explicit and stable?

## Rules

- Was `firestore.rules` reviewed?
- If rules did not change, was that decision intentional?

## Indexes

- Was `firestore.indexes.json` reviewed for new query shapes?
- If no index was added, is that justified by the current query pattern?

## Documentation

- Was `current-collections.md` updated if the collection or pattern changed?
- Were new conventions added to the relevant reference file?

## Validation

Run:

```bash
npm run firestore:check
```
