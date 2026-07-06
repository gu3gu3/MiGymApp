# MiGymApp — Skill Técnico para Agentes de IA

> Última actualización: 2026-07-04
> Repo: https://github.com/gu3gu3/MiGymApp

---

## 1. Visión General del Proyecto

**MiGymApp** es una plataforma SaaS B2B/B2C para gimnasios desarrollada con **Next.js 16 App Router**, **React 19**, **TypeScript**, **Tailwind CSS v4**, **Prisma ORM 7** y **PostgreSQL**. Soporta cuatro actores principales:

| Rol | Espacio | Acceso |
|-----|---------|--------|
| SUPER_ADMIN | `/superadmin/*` | Control central de gyms, sponsors, broadcasting y planes de plataforma. |
| GYM_ADMIN | `/admin/*` | Panel completo del gimnasio: POS, inventario, atletas, accesos, staff, suscripciones. |
| RECEPTIONIST / COACH | `/admin/*` | Subconjunto del panel (gatekeeper, pos, atletas). |
| ATHLETE | `/wallet/*` | PWA del atleta: wallet digital, QR de acceso, perfil, marketplace de planes. |

---

## 2. Arquitectura

```
/opt/migymapp
├── prisma/
│   ├── schema.prisma       # Modelo único de datos
│   └── migrations/         # Migraciones Prisma (migración inicial 20260629220000_init)
├── src/
│   ├── app/                # App Router de Next.js
│   │   ├── actions/        # Server Actions organizadas por dominio
│   │   ├── api/            # Route handlers (auth NextAuth, chat, checkin, etc.)
│   │   ├── admin/          # Panel de administración del gym
│   │   ├── superadmin/     # Panel de control central
│   │   ├── wallet/         # PWA del atleta
│   │   └── gym/[slug]/     # Landing pública y checkout del gym
│   ├── components/         # Componentes React por dominio
│   ├── lib/                # Prisma client, utilidades, stores
│   ├── services/           # Lógica de gamificación, checkin, auth, wallet
│   └── auth.config.ts      # Configuración de next-auth v5
├── .env                    # Variables de entorno (NO está en git)
├── next.config.ts          # Orígenes permitidos y ajustes de build
├── deploy.sh               # Script de despliegue en producción
└── .github/workflows/deploy.yml  # CI/CD con self-hosted runner
```

### Patrones clave

- **Server Actions** (`'use server'`) en `src/app/actions/` para mutaciones de datos.
- **Route Handlers** en `src/app/api/` para endpoints externos (chat IA, checkin, upload).
- **Autenticación** con `next-auth` v5 y adapter de Prisma.
- **Autorización** basada en `role` y `gymId` desde la sesión.
- **Decimales serializados explícitamente** con `Number()` para evitar problemas de `Decimal.js` en JSON.

---

## 3. Stack Tecnológico

| Capa | Tecnología |
|------|------------|
| Framework | Next.js 16.2.9 (Turbopack) |
| UI | React 19.2.4, Tailwind CSS 4, lucide-react |
| Auth | next-auth 5.0.0-beta.31, @auth/prisma-adapter |
| ORM | Prisma 7.8.0, @prisma/adapter-pg |
| DB | PostgreSQL local en producción (puerto 5433) |
| IA | ai SDK, @ai-sdk/google |
| Pagos/Wallet | Wallet digital con offline JWT |
| Deployment | Self-hosted GitHub Actions runner + systemd |

### Notas del stack

- `NODE_ENV=production` en `.env` hace que `npm ci` omita devDependencies. El deploy fuerza `NODE_ENV=development` para poder hacer build.
- `next.config.ts` tiene `typescript.ignoreBuildErrors: true` por problemas de tipado implícito heredados.
- `@tailwindcss/postcss` es devDependency y se requiere para build.

---

## 4. Modelo de Datos (Prisma)

### Entidades principales

- **User**: usuarios globales con roles (SUPER_ADMIN, GYM_ADMIN, RECEPTIONIST, COACH, ATHLETE).
- **Gym**: gimnasios con slug único, planes POS (KIOSKO/TIENDITA/SMART_BAR), estado `isLocked`.
- **Plan**: membresías/planes por gym. Pueden ser `TIME_BASED` o `CREDIT_BASED`.
- **Product**: productos del inventario POS (`isActive` indica soft delete).
- **Subscription**: relación M:N entre User-Gym-Plan con token offline y créditos restantes.
- **Sale / SaleItem**: ventas POS y marketplace de productos o planes.
- **CheckIn**: accesos al gym. Pueden venir de `subscriptionId` o `saleId` (pases express).
- **Sponsor / Competition**: competencias patrocinadas y broadcasting B2B.
- **PlatformPlan**: planes SaaS B2B para los gimnasios.

### Importante

- `Plan` ahora absorbe lo que antes era "Pase Express (1 Día)" como producto.
- Productos de tipo pase express ya no se usan; se migraron a planes `CREDIT_BASED`.
- El POS vende tanto `PRODUCT` como `PLAN` vía `itemType` en el carrito.

---

## 5. Áreas Funcionales Implementadas

### Admin del Gym (`/admin/*`)

| Ruta | Descripción |
|------|-------------|
| `/admin/pos` | Punto de venta físico: productos + planes + atletas. |
| `/admin/inventory` | Inventario con soft delete, edición e importación CSV. |
| `/admin/athletes` | Directorio de atletas del gym. |
| `/admin/attendance` | Historial de asistencias. |
| `/admin/gatekeeper` | Escáner QR para checkins y pases express. |
| `/admin/qr` | Generación de QR. |
| `/admin/subscription` | Gestión de suscripciones. |
| `/admin/staff` | Personal del gym. |
| `/admin/profile` | Perfil del admin. |
| `/admin/gym-health` | Métricas de salud del gym. |
| `/admin/gamification` | Tabla de líderes y XP. |
| `/admin/requests` | Solicitudes pendientes. |

### Super Admin (`/superadmin/*`)

| Ruta | Descripción |
|------|-------------|
| `/superadmin/gyms` | Gestión de gimnasios (lock/unlock, plan). |
| `/superadmin/plans` | Planes de plataforma B2B. |
| `/superadmin/broadcasting` | Emisión de competencias. |
| `/superadmin/security` | Seguridad central. |

### Wallet del Atleta (`/wallet/*`)

| Ruta | Descripción |
|------|-------------|
| `/wallet/login` | Login atleta. |
| `/wallet/register` | Registro atleta. |
| `/wallet/activate` | Activación de cuenta. |
| `/wallet/profile` | Perfil y suscripciones. |
| `/wallet/scan` | Escáner del atleta para checkin. |

### Público

| Ruta | Descripción |
|------|-------------|
| `/gym/[slug]` | Landing pública del gym con planes disponibles. |
| `/gym/[slug]/checkout/[planId]` | Checkout digital de planes. |
| `/login` | Login general. |

---

## 6. Reglas de Desarrollo para este Proyecto

### Antes de tocar código

1. **Nunca edites directamente en `/opt/migymapp` como entorno de desarrollo.** Este es producción.
2. **Lee el schema de Prisma** si vas a agregar/mover entidades.
3. **Si agregas un campo nuevo**, crea una migración con `npx prisma migrate dev --name nombre`.
4. **Si cambias el schema en desarrollo**, sube la migración; en producción se aplicará con `npx prisma migrate deploy`.

### Cuando escribas código

- Usa **Server Actions** para mutaciones; colócalas en `src/app/actions/<dominio>/`.
- Usa **Route Handlers** solo para APIs externas o webhooks.
- Serializa `Decimal` con `Number()` antes de pasar al cliente.
- No rompas la estructura de carpetas existente.
- Mantén los componentes en `src/components/<dominio>/`.
- Para soft delete de productos, usa `isActive = false`; para POS filtra `getProducts(..., onlyActive: true)`.

### Cuando hayas terminado

1. Commiteas en tu máquina de desarrollo en una rama feature.
2. Haces Pull Request hacia `main`.
3. Esperas que CI pase.
4. Mergeas → deploy automático en la Raspberry Pi.

---

## 7. Deployment y Producción

### Servidor de producción

- **Host**: Raspberry Pi 4, Debian 12 aarch64
- **Usuario servicio**: `migymapp`
- **Carpeta**: `/opt/migymapp`
- **Puerto**: 3001
- **Servicio**: `migymapp.service`
- **Runner CI/CD**: `migymapp-runner.service`
- **DB**: PostgreSQL en `127.0.0.1:5433`
- **Dominios**: `migym-app.com`, `migymp-app.com`

### Cómo se despliega

```bash
# En tu máquina de desarrollo
 git push origin main
```

GitHub Actions ejecuta:
1. CI en runner de GitHub (lint + build).
2. Deploy en self-hosted runner de la RPi ejecutando `sudo /opt/migymapp/deploy.sh`.

### Deploy manual (emergencias)

```bash
ssh root@produccion.migym-app.com sudo /opt/migymapp/deploy.sh
```

### Comandos útiles en producción

```bash
# Estado del servicio
systemctl status migymapp.service

# Logs en vivo
journalctl -u migymapp.service -f

# Logs del runner
journalctl -u migymapp-runner.service -f

# Backup manual
pg_dump <DATABASE_URL> > /opt/migymapp/backups/manual.sql
```

---

## 8. Decisiones de Diseño Conocidas

- **POS vende planes y productos**: unifica membresías y ventas físicas.
- **Pases express ahora son planes**: ya no existen como producto.
- **Offline token**: cada suscripción tiene un JWT pre-firmado para failover sin internet.
- **CheckIn dual**: puede provenir de `subscriptionId` (membresía) o `saleId` (pase express).
- **SaaS lock**: `Gym.isLocked` bloquea gimnasios morosos.
- **Currency/exchangeRate**: soporte inicial para C$ (NIO) y USD.

---

## 9. Tareas Típicas que el Usuario Puede Pedir

| Solicitud | Dónde actuar |
|-----------|--------------|
| "Agregar reporte X en admin" | Nuevo Server Action + página/componente en `/admin/*` |
| "Nuevo campo en atleta" | Schema Prisma → migración → Server Action → UI |
| "Restringir acceso a recept..." | Middleware/auth en Server Actions + role checks |
| "Nueva pantalla en wallet" | Nueva ruta en `/wallet/*` + componente en `components/wallet` |
| "Mejorar POS" | `src/components/pos/PosManager.tsx` y `src/app/admin/pos/actions.ts` |
| "Nueva funcionalidad de IA" | `src/app/api/chat/route.ts` o nuevo route handler |
| "Cambiar schema" | `prisma/schema.prisma` + migración + ajustar Server Actions |
| "Borrar datos demo" | SQL directo en PostgreSQL (como ya se hizo con productos/planes) |

---

## 10. Contacto / Contexto

Este skill asume que el código se desarrolla en una máquina de desarrollo separada y se despliega automáticamente en producción. No se deben hacer cambios directos en `/opt/migymapp` sin un PR posterior para sincronizar. El archivo `.env` y los datos de producción se respetan siempre.
