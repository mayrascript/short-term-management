# Short-Term Rental Management

App full-stack para gestión de rentas a corto plazo usando **Next.js + Firestore**.

## Stack actual

- Frontend + backend: **Next.js App Router** (`src/app`)
- Base de datos: **Cloud Firestore** (Firebase Admin SDK en route handlers)
- Deploy objetivo: **Firebase App Hosting**

## Requisitos previos

- **Node.js** (v20+ recomendado)
- Proyecto Firebase activo (ej: `dorado-suites-admin`)
- Credenciales para Firestore en entorno local:
  - `FIREBASE_PROJECT_ID` (o `GCLOUD_PROJECT` / `GOOGLE_CLOUD_PROJECT`)
  - opcionalmente `FIREBASE_CLIENT_EMAIL` + `FIREBASE_PRIVATE_KEY`

## Instalación

```bash
pnpm install
```

## Desarrollo local

```bash
pnpm dev
```

La app corre en `http://localhost:3000`.

## Build local

```bash
pnpm build
pnpm start
```

## Tests

Cada feature nueva debe incluir su test (reglas en `.claude/skills/test-discipline/` y hooks en `.husky/pre-commit` + `.claude/hooks/require-tests.sh`).

```bash
pnpm test         # Vitest: componentes, libs, route handlers
pnpm test:watch   # modo watch durante desarrollo
pnpm test:rules   # firestore.rules contra el emulador (requiere Java)
pnpm test:e2e     # Playwright e2e (primera vez: pnpm exec playwright install chromium)
pnpm test:all     # ejecuta los tres
```

Emergencia (solo humanos): `git commit --no-verify`. Abre follow-up inmediato para agregar el test.

## Agent Skills

Los skills (test-discipline, vitest, next-best-practices, shadcn, etc.) se instalan con el [Vercel skills CLI](https://skills.sh/) y se sincronizan entre Claude Code, Codex, Cursor y Antigravity. Regla y workflow completos en `AGENTS.md` → *Skills — CLI y sincronización*.

```bash
pnpm skills:add <source>   # instalar un skill (local o externo)
pnpm skills:install        # regenerar .claude/skills/ y .agents/skills/
pnpm skills:check          # verificar drift (lo hace también el pre-commit)
```

Fuente de verdad: `skills/`. Copias generadas (committed): `.claude/skills/`, `.agents/skills/`. Lockfile: `skills-lock.json`.

## Firebase App Hosting

Archivos relevantes:

- `firebase.json`
- `.firebaserc`
- `apphosting.yaml`
- `firestore.rules`
- `firestore.indexes.json`

Comandos típicos:

```bash
pnpm firebase login
pnpm firebase use dorado-suites-admin
pnpm firebase deploy --only firestore
pnpm firebase apphosting:backends:deploy short-term-management-backend --project dorado-suites-admin
```

## Estructura del proyecto

```
├── src/app/             # Next.js App Router (UI + API routes)
├── src/lib/             # Firebase admin y utilidades compartidas
├── backend/             # Legacy Express + MongoDB (referencia)
├── frontend/            # Legacy Vite + React (referencia)
├── .codex/skills/       # Skills locales versionados para Codex
├── firebase.json
├── apphosting.yaml
└── firestore.rules
```

## Skills locales de Codex

Este repositorio versiona un set local de skills en `.codex/skills/` para apoyar trabajo de `Next.js`, `React`, web UI y `shadcn/ui` sin depender de `~/.codex/skills`.

Skills instalados:

- `next-best-practices` desde `vercel-labs/next-skills`
- `vercel-react-best-practices` desde `vercel-labs/agent-skills` (origen del skill: `react-best-practices`)
- `web-design-guidelines` desde `vercel-labs/agent-skills`
- `frontend-design` desde `anthropics/skills`
- `interface-design` desde `dammyjay93/interface-design`
- `shadcn` desde `shadcn/ui` (corresponde al skill oficial documentado en `https://ui.shadcn.com/docs/skills`)
- `diagram-generator` desde `ialameh/sift-coder` (fijado al commit publicado por MCP Market: `63f56f5ad66224ddde1eb88a85d4d0323f6a80a2`)
- `diagram-precommit` como skill local del proyecto para validar Mermaid y regenerar SVG antes de commit
- `ui-guidelines` como skill local vivo para estandarizar el diseño, documentar patrones CRUD y exigir estados `loading`, `empty`, `error`, `success`
- `firestore-guidelines` como skill orquestador del proyecto para mantener consistencia entre código, tipos, rules, indexes y contratos de colecciones
- `firebase-basics` desde `firebase/agent-skills` (commit fijado: `bfd90c4c5ec5346d9ea2d387e7cc5949672994ab`)
- `firebase-firestore-standard` desde `firebase/agent-skills` (commit fijado: `bfd90c4c5ec5346d9ea2d387e7cc5949672994ab`)
- `firebase-app-hosting-basics` desde `firebase/agent-skills` (commit fijado: `bfd90c4c5ec5346d9ea2d387e7cc5949672994ab`)
- `firestore-security-rules-auditor` desde `firebase/agent-skills` (commit fijado: `bfd90c4c5ec5346d9ea2d387e7cc5949672994ab`)

Notas de mantenimiento:

- El repositorio `heilcheng/awesome-agent-skills` se usa solo como índice de descubrimiento; no es la fuente instalada.
- Para actualizar un skill, usa su upstream real y vuelve a copiarlo en `.codex/skills/`.
- Para reinstalar o actualizar el skill oficial de `shadcn/ui`, sigue el flujo recomendado por su documentación: `skills add shadcn/ui`.
- Los skills de Firebase instalados en este repo vienen del upstream `firebase/agent-skills` y quedaron fijados al commit `bfd90c4c5ec5346d9ea2d387e7cc5949672994ab` para mantener reproducibilidad.
- `web-design-guidelines` obtiene sus reglas en tiempo de uso desde el upstream de Vercel, por lo que su guía base puede cambiar sin modificar este repo.
- `diagram-generator` es autocontenido, pero algunas capacidades opcionales del skill dependen de herramientas externas como Mermaid CLI.
- El repo incluye `scripts/check-diagrams.sh` y un hook local `.git/hooks/pre-commit` para validar `docs/diagramas/*.mmd`, regenerar `docs/diagramas/svg/*.svg` y hacer `git add` automático de los SVG.
- Puedes ejecutar la validación manualmente con `npm run diagrams:check`.
- El repo incluye `scripts/check-ui-guidelines.sh` para revisar archivos UI tocados, validar el uso del guideline y exigir actualización de documentación cuando aparezcan componentes o patrones nuevos.
- Ejecuta `npm run ui:check` antes de cerrar features con UI.
- La fuente de verdad del guideline vive en `.codex/skills/ui-guidelines/`; si un feature introduce un patrón o componente reusable nuevo, esa documentación debe actualizarse en la misma tarea.
- El repo incluye `scripts/check-firestore-guidelines.sh` para revisar cambios de Firestore y exigir consistencia entre `src/app/api`, `src/lib/types.ts`, `firestore.rules`, `firestore.indexes.json` y la documentación de contratos de colecciones.
- Ejecuta `npm run firestore:check` en cualquier feature que cree o cambie colecciones, queries, rules o indexes.
- La fuente de verdad del estándar Firestore vive en `.codex/skills/firestore-guidelines/`.
