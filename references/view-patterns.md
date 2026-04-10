# View Patterns

## Allowed CRUD variants

- **standard CRUD** — form + list/table, create/read/update/delete
- **pipeline** — kanban-style columns with drag or status transitions
- **quick-create** — inline 1-2 field form above content area

---

## View layout rules

### Two-column (form + content)

```
gridTemplateColumns: "minmax(300px, 1fr) 2fr"
```

Use when the view has a **persistent creation/editing form** alongside a data area (table, cards, pipeline).

- The form goes in the **left card**, the main content in the **right card**.
- Both cards sit inside a `div.grid-cards` with the template above.
- Examples: `finance`, `social`, `guests`

### Single-column stacked

```
gridTemplateColumns: "minmax(300px, 1fr)"
```

Use when the view is a list/cards **without a persistent creation form**, or when the form is simple enough to be a quick-create inline above the content.

- Example: `tasks` (quick-create inline + list)

### Decision rule

| Form complexity | Layout |
|---|---|
| 3+ fields | Two-column (form left, content right) |
| 1-2 fields (quick-create) | Single-column with form inline |
| No creation form | Single-column |

---

## Repo-specific examples

### `finance`
Pattern:
- standard CRUD
- form + table
- date-range filter
- edit inline (form reuses left card)
- soft-delete / trash toggle

Required states:
- loading on fetch
- empty when no expenses exist
- error on fetch/create/update/delete failures
- success for create

### `social`
Pattern:
- standard CRUD
- form + pipeline (kanban columns)
- status transitions

Required states:
- loading on fetch
- empty when no posts exist
- error on fetch/create/delete failures
- success for create

### `guests`
Pattern:
- standard CRUD
- form + table
- search filter
- detail modal

Required states:
- loading on fetch
- empty when no guests exist
- error on fetch/create/delete failures
- success for create/delete

### `tasks`
Pattern:
- quick-create inline + list
- status transitions (pending → in_progress → completed)

Required states:
- loading on fetch
- empty when no tasks exist
- error on fetch/create/update/delete failures
