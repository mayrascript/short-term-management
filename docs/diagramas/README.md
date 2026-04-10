# Diagramas del sistema actual

Este directorio reúne diagramas Mermaid del sistema activo en producción y desarrollo local:

- `Next.js App Router`
- páginas cliente del dashboard
- route handlers en `src/app/api`
- `Firebase Admin SDK`
- `Cloud Firestore`
- despliegue en `Firebase App Hosting`

Diagramas incluidos:

- `01-arquitectura-actual.mmd`: vista de alto nivel del sistema vigente
- `02-superficie-api-y-colecciones.mmd`: mapa de endpoints y colecciones Firestore
- `03-modelo-datos-firestore.mmd`: ERD lógico del modelo actual en Firestore
- `04-secuencia-finanzas.mmd`: flujo detallado del módulo de finanzas

Fuera de alcance para este set:

- `backend/`: implementación legacy basada en Express + MongoDB/Mongoose
- `frontend/`: implementación legacy basada en Vite + React Router
- `src/app/api/guesty`: el directorio existe, pero hoy no tiene handlers implementados

Notas:

- Los diagramas están escritos como fuente Mermaid (`.mmd`) para facilitar revisión y versionado.
- No se incluyen SVG en esta primera versión.
- Las relaciones representadas reflejan la arquitectura actual observada en `src/` y la configuración Firebase del repo.
