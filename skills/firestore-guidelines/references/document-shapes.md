# Document Shapes

## General rules

- Firestore document shapes and API response shapes are related but not identical.
- Firestore stores native `Timestamp`.
- API responses expose ISO strings and `_id`.

## Create payloads

- Validate required fields before writing.
- Normalize strings and enums.
- Generate lifecycle metadata in the handler, not from the client.

## Update payloads

- Support partial updates only if the route is explicitly designed that way.
- Always refresh `updatedAt`.
- Preserve existing stored fields unless the update is intentionally destructive.

## Read payloads

- Convert `doc.id` to `_id`.
- Serialize `Timestamp` values to ISO.
- Normalize missing optional fields consistently.

## Shapes already used in the repo

- `reservations`
  - `guestName`, `checkIn`, `checkOut`, `revenue`, `status`
- `posts`
  - `idea`, `platform`, `status`, `scheduledDate`
- `tasks`
  - `title`, `description`, `category`, `status`
- `expenseCategories`
  - `name`, `slug`
- `expenses`
  - `description`, `amount`, `category`, `comment`, `tags`, `currency`, `receiptUrl`, `date`, `isDeleted`, `deletedAt`

## Shared utility preference

If two or more handlers repeat the same normalization or serialization rule, prefer extracting shared helpers to `src/lib/serverUtils.ts`.
