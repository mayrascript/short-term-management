# Modeling Conventions

## Collection naming

Use plural collection names and keep the project's observed style:

- `reservations`
- `posts`
- `tasks`
- `expenses`
- `expenseCategories`

Do not introduce a new naming style without documenting why.

## API document vs Firestore document

- Persist Firestore documents without `_id` unless there is an explicit exception.
- Expose `_id` in API responses using `doc.id`.
- Keep serialization logic consistent across collections.

## Required metadata

Default required metadata:

- `createdAt`
- `updatedAt`

Conditional metadata:

- `isDeleted`
- `deletedAt`
- `slug`

## Timestamps

- Store dates and lifecycle metadata as Firestore `Timestamp`.
- Convert outbound values to ISO strings for the frontend.
- Use shared helpers such as:
  - `toIso`
  - `toTimestamp`
  - `nowTimestamp`

## Soft-delete

Only introduce soft-delete if the domain needs recoverability or trash semantics.

If used, it must include:

- `isDeleted`
- `deletedAt`
- restore flow
- query behavior
- index review
- rules review

## Slugs

If the collection needs a human-stable identifier:

- define whether `slug` is required
- centralize generation via shared utility
- document uniqueness expectations

## Enums and controlled strings

If a field is effectively constrained by product logic:

- represent it as a TypeScript union in `src/lib/types.ts`
- keep create/update paths aligned
- document the allowed values in the collection contract

Examples already in the repo:

- reservation `status`
- task `category`
- task `status`
- post `status`
- expense `currency`

## Arrays and nullability

- Prefer explicit null handling when a field can be absent but semantically meaningful.
- Keep array element types constrained and documented.
- Keep serialization behavior consistent across routes.
