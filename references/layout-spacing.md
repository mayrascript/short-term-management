# Layout & Spacing

## Core layout primitives

### grid-cards

The `.grid-cards` class provides the responsive card grid. Override `gridTemplateColumns` inline to control column layout per view.

#### Grid templates

| Layout | `gridTemplateColumns` | When to use |
|---|---|---|
| Two-column form+content | `"minmax(300px, 1fr) 2fr"` | Persistent form + data area |
| Single-column | `"minmax(300px, 1fr)"` | List/cards without persistent form |

### page-header

Every dashboard page starts with:
```html
<div class="page-header">
  <h1 class="page-title">Title</h1>
  <p class="page-subtitle">Description.</p>
</div>
```

### card

Individual content sections wrapped in `.card`. Each column in a two-column layout is one `.card`.

## Spacing tokens

- Card padding: inherited from `.card` class
- Grid gap: inherited from `.grid-cards` class
- Form group spacing: inherited from `.form-group` class
- Section margin: `marginBottom: "16px"` or `"20px"` for card-level sections
