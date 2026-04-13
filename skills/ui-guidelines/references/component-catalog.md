# Component Catalog

This file is the catalog of reusable UI patterns that already exist or are approved.

Every new reusable component or meaningful reusable variant must be added here in the same feature that introduces it.

## Component: DashboardShell

- Path: `src/components/dashboard-shell.tsx`
- Purpose: primary dashboard shell with sidebar navigation and main content region
- Variants: none today
- Uses:
  - sidebar navigation
  - branded app shell
  - current dashboard information architecture
- Rules:
  - keep sidebar width and primary nav rhythm consistent
  - use project navigation icon style from `lucide-react`

## Component: Page Header

- Current basis: `.page-header`, `.page-title`, `.page-subtitle`
- Purpose: top-of-view structure for title, subtitle, and optional actions
- Rules:
  - every main dashboard view should start with this pattern
  - title and subtitle should remain compact and scannable

## Component: Card

- Current basis: `.card`
- Purpose: default elevated surface for forms, lists, and summary blocks
- Rules:
  - prefer card before inventing one-off panels
  - internal spacing should follow the existing 16px/24px rhythm

## Component: Button

- Path: `src/components/ui/button.tsx`
- Purpose: reusable action primitive
- Variants:
  - `default`
  - `destructive`
  - `outline`
  - `secondary`
  - `ghost`
  - `link`
- Sizes:
  - `default`
  - `xs`
  - `sm`
  - `lg`
  - icon variants
- Rules:
  - prefer this button over raw `.btn` for newly normalized reusable actions
  - keep icon usage aligned with `lucide-react`

## Component: Form Group

- Current basis: `.form-group`, `.form-label`
- Purpose: basic labeled input grouping
- Rules:
  - keep label spacing and vertical rhythm consistent
  - if a richer form primitive is introduced, add it here and clarify migration guidance

## Component: Badge

- Current basis: `.badge`, `.badge-success`, `.badge-warning`, `.badge-primary`, `.badge-neutral`
- Purpose: compact semantic status or category display
- Rules:
  - use badge colors for meaning, not decoration
  - add new badge semantics only if the current set does not fit

## Component: Table Container

- Current basis: `.table-container`
- Purpose: responsive wrapper for dense tabular data
- Rules:
  - default choice for operational CRUD lists
  - pair with clear empty/error/loading states around the table

## Recommended next reusable patterns

These are not fully implemented yet, but the guideline reserves them:

- `EmptyState`
- `ErrorState`
- `LoadingBlock` or `SkeletonBlock`
- `SuccessMessage` or `InlineFeedback`

When one of these is introduced, add a full catalog entry immediately.
