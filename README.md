# Short-Term Rental Management

App full-stack para gestión de rentas a corto plazo.

## Requisitos previos

- **Node.js** (v18+)
- **MongoDB** corriendo localmente (puerto 27017 por defecto) o una URI de conexión remota

## Instalación

```bash
# Dependencias del root (Next.js boilerplate)
npm install

# Dependencias del backend
cd backend
npm install

# Dependencias del frontend
cd ../frontend
npm install
```

## Configuración

Crea el archivo de variables de entorno para el backend:

```bash
cp backend/.env.example backend/.env
```

Edita `backend/.env` si necesitas cambiar el puerto o la URI de MongoDB.

## Correr el proyecto

Necesitas dos terminales:

**Terminal 1 — Backend (Express + MongoDB)**
```bash
cd backend
npm run dev
```

**Terminal 2 — Frontend (Vite + React)**
```bash
cd frontend
npm run dev
```

El backend corre en `http://localhost:5001` y el frontend en `http://localhost:5173`.

## Estructura del proyecto

```
├── backend/          # API Express + TypeScript + Mongoose
│   └── src/
├── frontend/         # Vite + React
│   └── src/
├── app/              # Next.js (boilerplate, no se usa activamente)
└── package.json      # Root (Next.js)
```
