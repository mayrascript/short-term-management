# Query and Write Patterns

## Approved read patterns

- collection GET with stable ordering
- filtered GET with explicit query params
- filtered GET + `orderBy(...)`
- list serialization with `_id` and ISO dates

## Approved write patterns

- POST create with normalized payload and generated metadata
- PUT update with validation and `updatedAt`
- PATCH for focused lifecycle transitions like restore
- DELETE for soft-delete when the domain requires trash semantics

## Existing repo patterns

### Reservations

- GET ordered by `checkIn`
- POST creates `createdAt` and `updatedAt`

### Posts

- GET ordered by `createdAt desc`
- POST create
- PUT update by id

### Tasks

- GET ordered by `createdAt desc`
- POST create
- PUT update by id

### Expense categories

- GET ordered by `name asc`
- POST create with slug uniqueness check

### Expenses

- GET supports:
  - `includeDeleted`
  - `startDate`
  - `endDate`
- POST create
- PUT update
- DELETE soft-delete
- PATCH restore

## Conflict handling

At minimum:

- validate required fields
- return meaningful 400/404/409 where appropriate
- do not silently change collection semantics without documenting them
