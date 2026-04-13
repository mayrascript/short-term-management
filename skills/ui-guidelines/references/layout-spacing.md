# Layout and Spacing

## Primary shell

The active dashboard shell is defined by:

- `.app-container`
- `.sidebar`
- `.main-content`
- `.brand`
- `.nav-links`
- `.nav-link`

These patterns are the default for dashboard views.

## Page structure

Every main dashboard view should prefer this order:

1. `page-header`
2. primary content block
3. secondary cards or data blocks

## Existing spacing scale in practice

The current UI repeatedly uses:

- `6px`
- `8px`
- `10px`
- `12px`
- `16px`
- `20px`
- `24px`
- `32px`

Default preference:

- `8px` for tight inline grouping
- `12px` for icon + text or small control grouping
- `16px` for form row and card-internal rhythm
- `24px` for card padding and grid gaps
- `32px` for page section separation

## Core layout primitives

### `page-header`

Use for:

- title
- subtitle
- top-level action cluster if needed

### `card`

Use as the default surface for:

- forms
- data blocks
- summary blocks
- list sections

### `grid-cards`

Use for:

- multiple cards at the same hierarchy level
- responsive distribution of summary or content cards

Avoid ad hoc grid systems unless the existing primitive clearly does not fit.

## Forms

Base primitives today:

- `.form-group`
- `.form-label`
- native `input`, `select`, `textarea`

When a form becomes repeated or more complex, prefer introducing a reusable component pattern and documenting it.

## Tables

Base primitives today:

- `.table-container`
- native `table`, `th`, `td`

Use tables when users need comparison across rows and multiple aligned attributes.

## Spacing rules

- Prefer existing card/grid/page spacing before introducing inline margins.
- Inline spacing is tolerated only when no reusable pattern exists yet, but it should be treated as a signal to normalize the pattern.
- If the same spacing pattern repeats in multiple files, extract or document it.
