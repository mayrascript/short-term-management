# View Patterns

## Standard view template

Every main dashboard view should aim for:

1. `page-header`
2. primary action or summary section
3. main content section
4. secondary detail sections if required

## Required UI states

Every main view must explicitly account for:

### `loading`

- Show a loading placeholder or clear loading message.
- Never leave the user with an unexplained blank region.

### `empty`

- Show a meaningful empty state message.
- Include a CTA when the user can create the first item or fix the lack of data.

### `error`

- Show visible error feedback in the UI.
- `console.error` alone is not sufficient.
- Add retry or recovery affordance when the action matters.

### `success`

- Show visible success feedback for create/update/delete/restore when the action materially changes state.
- Inline confirmation is acceptable for CRUD screens.

## CRUD view pattern

Use this as the default for CRUD-oriented screens.

### Structure

1. Header
   - title
   - subtitle
   - primary action if needed
2. Controls
   - filters
   - date ranges
   - search
   - state toggles
3. Mutation area
   - create form
   - edit form
   - inline action cluster
4. Read area
   - table for dense comparable data
   - card list for lighter or more visual records
5. Feedback area
   - loading
   - empty
   - error
   - success

### Allowed CRUD variants

- `form + table`
- `form + cards`
- `inline edit + list`

### Table vs card guidance

- Use a table when users compare columns across many items.
- Use cards when each object benefits from compact presentation or fewer comparable fields.

## Repo-specific examples

### `finance`

Pattern:

- complex CRUD
- form + table
- filters
- trash mode
- edit and restore actions

Required states:

- loading on ledger fetch
- empty when no expenses match
- error for fetch and mutation failures
- success for create/update/delete/restore

### `tasks`

Pattern:

- lightweight CRUD
- quick-create + list

Required states:

- loading on fetch
- empty when no tasks exist
- error on create/toggle failures
- success feedback when mutations occur

### `social`

Pattern:

- create + pipeline list

Required states:

- loading on fetch
- empty when pipeline has no posts
- error on fetch/create failure
- success on create

## New view rule

If a new feature introduces a CRUD variant not covered here, update this file in the same task.
