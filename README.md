# SoftTech HelpDesk — Frontend

Portal **enterprise** de gestión de incidencias para el ERP de **SoftTech Solutions**. Interfaz construida
con **Next.js (App Router) + TypeScript + Tailwind CSS v4 + shadcn/ui (Radix UI)**, con enfoque UI/UX premium
(soporte claro/oscuro, tipografía y tokens de color personalizados).

Se integra con el backend reactivo **helpdesk-service** (Quarkus 3, Java 17) a través de su API REST.

---

## 1. Stack

| Componente | Tecnología |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Lenguaje | TypeScript |
| Estilos | Tailwind CSS v4 + shadcn/ui (Radix UI, preset Nova) |
| Iconos | Lucide React |
| Tema | next-themes (claro/oscuro) |
| Cliente HTTP | Axios (interceptores JWT) |
| Formularios | React Hook Form + Zod |
| Gráficos | Recharts |
| Notificaciones | Sonner |
| Gestor de paquetes | npm |

---

## 2. Requisitos

- Node.js ≥ 20
- Backend `helpdesk-service` corriendo (por defecto en `http://localhost:8080`)

---

## 3. Configuración

Copia el archivo de ejemplo y ajusta la URL del backend:

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

> Si el backend corre en otro host/puerto, cambia `NEXT_PUBLIC_API_URL`.

---

## 4. Ejecución

```bash
npm install
npm run dev       # http://localhost:3000
```

Build de producción:

```bash
npm run build
npm run start
```

Lint:

```bash
npm run lint
```

---

## 5. Autenticación

El frontend usa el endpoint de login de desarrollo del backend (`POST /api/v1/auth/login`, disponible solo
en el perfil `dev` del backend). Credenciales de prueba:

| Email | Contraseña | Rol | Pantalla inicial |
|---|---|---|---|
| `cliente@softtech.com` | `dylan` | `CLIENTE` | `/portal` |
| `soporte@softtech.com` | `dylan` | `SOPORTE_TI` | `/agent/tickets` |
| `admin@softtech.com` | `dylan` | `ADMIN` | `/dashboard` |

El JWT se guarda en `localStorage` y se inyecta en cada petición vía el interceptor de Axios.

---

## 6. Pantallas

| Ruta | Descripción |
|---|---|
| `/login` | Inicio de sesión con tarjetas de acceso rápido por rol |
| `/portal` | Portal del cliente: creación guiada de tickets + bandeja maestro-detalle (Abiertos / Completados) con historial de actividad |
| `/agent/tickets` | Mesa de ayuda: tabla con filtros, semáforos de SLA y acciones (asignar, investigar, resolver, cancelar) |
| `/dashboard` | Dashboards analíticos con Recharts (tickets en el tiempo, SLA, por módulo ERP, por estado) y actividad reciente |

---

## 7. Estructura del proyecto

```
helpdesk-frontend/
├── .env.example                         # Variables de entorno de ejemplo
├── opencode.json                        # (local) Configuración MCP de Google Stitch
├── components.json                      # Configuración de shadcn/ui
├── public/                              # Assets estáticos
└── src/
    ├── app/
    │   ├── layout.tsx                   # Layout raíz (ThemeProvider, TooltipProvider, Toaster)
    │   ├── globals.css                  # Tokens de diseño y tema (claro/oscuro)
    │   ├── page.tsx                     # Redirect → /portal
    │   ├── (auth)/login/page.tsx        # Login
    │   └── (app)/
    │       ├── layout.tsx               # Shell autenticado (AuthGuard + AppShell)
    │       ├── portal/page.tsx          # Portal del cliente
    │       ├── agent/tickets/page.tsx   # Mesa de ayuda
    │       └── dashboard/page.tsx       # Dashboards
    ├── components/
    │   ├── ui/                          # Componentes shadcn/ui
    │   ├── layout/                      # AppSidebar, AppShell, ThemeToggle, UserNav
    │   ├── tickets/                     # StatusBadge, PriorityBadge, SlaIndicator, CsatModal,
    │   │                                #   TicketDetail, CreateTicketForm
    │   ├── theme-provider.tsx           # Proveedor de tema (next-themes)
    │   └── auth-guard.tsx               # Guard de sesión cliente
    ├── hooks/
    │   ├── use-session.ts               # Sesión (JWT en localStorage)
    │   └── use-tickets.ts               # Carga de tickets
    ├── lib/
    │   ├── api.ts                       # Cliente Axios + interceptores
    │   ├── auth.ts                      # Gestión del token y rol
    │   ├── constants.ts                 # Roles, estados, prioridades, módulos, SLA
    │   └── format.ts                    # Formato de fechas y semáforo SLA
    └── types/
        └── api.ts                       # Tipos alineados con los DTOs del backend
```

---

## 8. Contrato con el backend

Los tipos de `src/types/api.ts` están alineados con los DTOs reales del backend:

- **Estados**: `OPEN`, `ASSIGNED`, `IN_PROGRESS`, `RESOLVED`, `CLOSED`, `CANCELLED`.
- **Prioridades**: `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`.
- **Módulos ERP**: `FINANCIAL`, `BILLING`, `INVENTORY`, `SALES`, `CRM`, `HUMAN_RESOURCES`, `SUPPLY_CHAIN`, `CORE_SYSTEM`.
- **Roles**: `CLIENTE`, `SOPORTE_TI`, `ADMIN`.

Endpoint principal: `GET /api/v1/tickets` (lista de tickets), más los comandos `PATCH`
(`/assign`, `/start-investigation`, `/resolve`, `/close`, `/cancel`) y `POST /api/v1/tickets`.

---

## 9. Google Stitch (prototipo)

El prototipo visual vive en **Google Stitch** y se accede vía MCP. La configuración del servidor MCP de
Stitch está en `opencode.json` (local, no versionado). Tras configurarlo, reinicia opencode para cargar las
herramientas MCP de Stitch y poder leer el prototipo.
