# Design Tokens

This project's visual baseline comes from `src/app/globals.css`.

## Core palette

- Background: `#f8fafc`
- Foreground: `#0f172a`
- Card: `#ffffff`
- Primary: `#4f46e5`
- Primary hover: `#4338ca`
- Secondary surface: `#eef2ff`
- Accent surface: `#e0e7ff`
- Muted surface: `#f1f5f9`
- Muted text: `#64748b`
- Border: `#e2e8f0`
- Success: `#10b981`
- Warning: `#f59e0b`
- Danger / destructive: `#ef4444`

## Semantic usage

- Use `primary` for primary CTAs, active navigation, focus language, and high-emphasis brand actions.
- Use muted and border tokens for structure, supporting copy, and low-emphasis surfaces.
- Use success/warning/danger only for state meaning, not decorative accents.
- Prefer semantic variables from `globals.css` over hardcoded hex values.

## Radius

- Global radius base: `0.75rem`
- Common rounded surfaces:
  - cards: `12px`
  - buttons: `8px`
  - badges: pill shape

## Shadows

- Cards use soft elevation, not dramatic shadowing.
- Hover states should feel subtle and operational, not flashy.

## Typography

- Body font stack starts with `Inter`.
- Titles are bold and compact.
- Supporting copy uses muted text.

## Iconography

- Use `lucide-react`, consistent with the current codebase and `components.json`.
- Icons support hierarchy; they should not become the primary source of color variation.

## Token rules

- Do not introduce raw spacing/color/radius values when an existing token or class already covers the use case.
- If a new semantic token becomes necessary, it must be documented here and in the implementation.
