# Tickets — Gestor de tareas del equipo

Aplicación web para gestionar tareas/tickets con flujo de estados, filtros, roles
(Admin / Usuario), comentarios, notificaciones in-app y registro de actividad.

Estética inspirada en un panel limpio y moderno (sidebar oscuro, tarjetas, badges de
estado y prioridad).

## 🧱 Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **TailwindCSS v4** (configuración por CSS)
- **Prisma 7** + **PostgreSQL** (con driver adapter `@prisma/adapter-pg`)
- **Auth propia**: JWT (`jose`) en cookie `httpOnly` + `bcryptjs`
- **Docker / Docker Compose** para la base de datos y el despliegue

## 🚀 Puesta en marcha (desarrollo local)

Requisitos: Node 20+, Docker Desktop.

```bash
# 1. Instalar dependencias
npm install

# 2. Variables de entorno
cp .env.example .env        # y revisa los valores (sobre todo ADMIN_PASSWORD)

# 3. Levantar la base de datos (Postgres en Docker, puerto 5433)
npm run db:up

# 4. Crear las tablas y los datos iniciales (admin + 2 usuarios + tareas demo)
npm run db:migrate
npm run db:seed

# 5. Arrancar la app
npm run dev
```

Abre **http://localhost:3000** (o el puerto que indique la consola si el 3000 está ocupado).

> En este equipo el puerto **3000** y el **5432** ya los usa otra app, por eso el
> Postgres de Tickets va en el **5433** y el dev server puede arrancar en el **3001**.

### Credenciales iniciales (del seed)

| Rol | Email | Contraseña |
|-----|-------|------------|
| Admin | `manresaperezantonio@gmail.com` | `cambia-esta-contrasena` |
| Usuario | `francisco@ejemplo.com` | `usuario1234` |
| Usuario | `companero@ejemplo.com` | `usuario1234` |

⚠️ Cambia estas contraseñas (edita `ADMIN_PASSWORD` en `.env` antes del seed, y crea
los usuarios reales desde **Usuarios** una vez dentro).

## 📜 Scripts útiles

| Comando | Qué hace |
|---------|----------|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` / `npm start` | Build y arranque de producción |
| `npm run db:up` | Levanta Postgres + Adminer en Docker |
| `npm run db:migrate` | Crea/aplica migraciones (desarrollo) |
| `npm run db:deploy` | Aplica migraciones (producción) |
| `npm run db:seed` | Inserta datos iniciales |
| `npm run db:studio` | Prisma Studio (explorar la BD) |
| `npm run db:reset` | Borra y recrea la BD (¡cuidado!) |

Adminer (inspeccionar la BD a mano): http://localhost:8080 — Sistema `PostgreSQL`,
Servidor `db`, Usuario `tickets`, Contraseña `tickets_dev_pw`, BD `tickets`.

## ✨ Funcionalidades

- **Dashboard** con contadores (Pendientes / En progreso / En revisión / Finalizadas),
  "Mis tareas activas" y "Tareas recientes".
- **Tareas** con flujo: Pendiente → En progreso → Revisión usuario → Revisión admin → Finalizada.
- **Filtros**: búsqueda por texto, estado, prioridad, usuario, rango de fechas y
  "mostrar finalizadas".
- **Detalle de tarea**: cambio de estado, edición, comentarios, registro de actividad.
- **Prioridades** (Baja/Media/Alta/Urgente), **puntos**, **horas estimadas**,
  **etiquetas** y **fecha límite**.
- **Calendario**: tareas con fecha límite ordenadas por vencimiento.
- **Usuarios** (solo admin): crear cuentas y asignar rol.
- **Notificaciones in-app** (asignaciones, comentarios) y **log de auditoría**.
- **Roles**: Admin (control total, borrar tareas, gestionar usuarios) y Usuario.

## ☁️ Despliegue

### Opción A — Vercel + Neon (gratis, recomendado para remoto)

1. Crea una base de datos en [Neon](https://neon.tech) y copia su cadena de conexión.
2. Sube el repo a GitHub e impórtalo en [Vercel](https://vercel.com).
3. En Vercel define las variables de entorno: `DATABASE_URL` (la de Neon, con
   `?sslmode=require`), `AUTH_SECRET`, `ADMIN_*`.
4. Aplica migraciones contra Neon: `DATABASE_URL=... npx prisma migrate deploy` y
   `DATABASE_URL=... npm run db:seed` (una vez).

### Opción B — Todo en Docker (VPS propio)

```bash
# Define AUTH_SECRET, ADMIN_* y POSTGRES_PASSWORD en el entorno/.env
docker compose -f docker-compose.prod.yml up -d --build
```

Arranca la app (puerto 3000) + Postgres, aplica migraciones automáticamente y queda
con `restart: unless-stopped` (se levanta sola al reiniciar la máquina).

## 🗂️ Estructura

```
src/
  app/
    (app)/            Rutas protegidas (dashboard, tareas, calendario, usuarios)
    api/              Endpoints (auth, tasks, users)
    login/            Página de acceso
  components/         UI (sidebar, badges, formularios, tarjetas)
  lib/                prisma, auth, constantes y utilidades
prisma/
  schema.prisma       Modelo de datos
  seed.ts             Datos iniciales
proxy.ts              Protección de rutas (antes "middleware")
```

## 🔒 Notas

- La autenticación usa una cookie `httpOnly` firmada con `AUTH_SECRET`. Mantén ese
  secreto fuera de git (ya está en `.gitignore` vía `.env`).
- Prisma 7 requiere driver adapter: la URL de conexión vive en `prisma.config.ts`
  (no en `schema.prisma`).
