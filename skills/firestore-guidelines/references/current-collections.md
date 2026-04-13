# Current Collection Contracts

This file is the baseline contract for active Firestore collections in the repo.

## Collection: reservations

- Purpose: reservation records for the dashboard overview
- Core fields:
  - `guestName`
  - `checkIn`
  - `checkOut`
  - `revenue`
  - `status`
  - `createdAt`
  - `updatedAt`
- Query patterns:
  - ordered by `checkIn asc`
- Rules review status:
  - baseline permissive rules currently apply
- Index review status:
  - no explicit index recorded in repo for current query shape
- Endpoints:
  - `GET /api/reservations`
  - `POST /api/reservations`

## Collection: posts

- Purpose: social content pipeline records
- Core fields:
  - `idea`
  - `platform`
  - `status`
  - `scheduledDate`
  - `createdAt`
  - `updatedAt`
- Query patterns:
  - ordered by `createdAt desc`
- Rules review status:
  - baseline permissive rules currently apply
- Index review status:
  - no explicit index recorded in repo for current query shape
- Endpoints:
  - `GET /api/posts`
  - `POST /api/posts`
  - `PUT /api/posts/[id]`

## Collection: tasks

- Purpose: operational property tasks
- Core fields:
  - `title`
  - `description`
  - `category`
  - `status`
  - `createdAt`
  - `updatedAt`
- Query patterns:
  - ordered by `createdAt desc`
- Rules review status:
  - baseline permissive rules currently apply
- Index review status:
  - no explicit index recorded in repo for current query shape
- Endpoints:
  - `GET /api/tasks`
  - `POST /api/tasks`
  - `PUT /api/tasks/[id]`

## Collection: expenseCategories

- Purpose: normalized expense category catalog
- Core fields:
  - `name`
  - `slug`
  - `createdAt`
  - `updatedAt`
- Query patterns:
  - ordered by `name asc`
  - uniqueness check by `slug`
- Rules review status:
  - baseline permissive rules currently apply
- Index review status:
  - uniqueness is enforced in code, not by Firestore unique constraint
- Endpoints:
  - `GET /api/expense-categories`
  - `POST /api/expense-categories`

## Collection: expenses

- Purpose: expense ledger with trash/restore workflow
- Core fields:
  - `description`
  - `amount`
  - `category`
  - `comment`
  - `tags`
  - `currency`
  - `receiptUrl`
  - `date`
  - `isDeleted`
  - `deletedAt`
  - `createdAt`
  - `updatedAt`
- Query patterns:
  - filtered by `isDeleted`
  - ordered by `date desc`
  - date range filters on `date`
- Rules review status:
  - baseline permissive rules currently apply
- Index review status:
  - explicit indexes exist for `isDeleted + date`
- Endpoints:
  - `GET /api/expenses`
  - `POST /api/expenses`
  - `PUT /api/expenses/[id]`
  - `DELETE /api/expenses/[id]`
  - `PATCH /api/expenses/[id]/restore`

## Normalization guidance

This baseline is compatible with the current app. Future features should converge toward:

- explicit collection contracts
- centralized serialization helpers
- documented rule decisions
- explicit index reviews for every new query family
