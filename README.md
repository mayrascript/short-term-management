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
├── firebase.json
├── apphosting.yaml
└── firestore.rules
```
