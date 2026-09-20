# G4 Drivers — Frontend (sign-up de conductores)

SPA de registro y gestión de conductores para G4. Los usuarios entran con Google
(Supabase Auth), completan un wizard de aplicación (comfort / luxury), suben
documentos, y los admins revisan todo desde un dashboard.

## Stack

- Vite + React 18 + TypeScript (SPA, **no Next.js** — las reglas RSC/server no aplican)
- shadcn/ui sobre Radix + Tailwind (`src/components/ui/` es generado; no editar a mano)
- TanStack Query v5 para datos del servidor, axios (`src/lib/api.ts`) para transporte
- Supabase: solo Auth (Google OAuth) + Storage público de assets. La base de datos
  vive detrás de la API propia, no se consulta Supabase directamente.
- framer-motion (landing/wizard), recharts (admin), sonner + toaster de shadcn
- Deploy: Vercel (`vercel.json` reescribe todo a `/index.html` para el router)

Comandos: `npm run dev` (puerto 8080), `npm run build`, `npm run lint`.

## Arquitectura

```
src/
  pages/        Index (landing), Login, AuthCallback, RegisterDriver (wizard),
                UserProfile, AdminDashboard, legales (Privacy/Terms/DriverAgreement)
  components/   ProfileDetailsModal, DocumentUploadField, ProtectedRoute,
                ParticlesBackground, LandingAlternate/*, ui/ (shadcn)
  services/     auth / dashboard / admin / vision — única capa que habla con la API
  providers/    AuthProvider (sesión Supabase + logout global)
  lib/          api (axios), supabase, assets, logger, postLoginRoute, utils
```

Regla: los componentes no llaman a `api` directamente, pasan por `services/*`.
Los tipos de respuesta viven junto a su servicio (`dashboard.service.ts`,
`admin.service.ts`); están **intencionalmente sin unificar** porque admin y
dashboard devuelven campos distintos.

## Auth y ruteo

- `AuthProvider` mantiene la sesión de Supabase y escucha el evento
  `auth:unauthorized` que emite el interceptor de axios ante un 401 → signOut +
  limpieza de localStorage + redirect a `/login`.
- `ProtectedRoute` exige sesión; `AdminRoute` además exige `role === 'admin'`
  según `/user/me`. Es defensa en profundidad: la barrera real es el middleware
  JWT del backend.
- `resolvePostLoginRoute()` (`lib/postLoginRoute.ts`) centraliza el branching
  post-login. **No dupliques esa lógica** en Login/AuthCallback: ya causó un bug
  (un `pendingDriverType` viejo mandaba usuarios registrados de vuelta al wizard).
- Flags de localStorage en juego: `pending_referral`, `pendingDriverType`,
  `isAdminLoginAttempt`.

## API

Base: `VITE_API_URL` (+ `/api` que agrega `lib/api.ts`). Endpoints usados:

- `GET /user/me` — perfil + rol + aplicación (`exists` = hay application con id real)
- `GET /user/dashboard?page&limit` — perfil, referidos paginados, aplicación
- `PUT /user/profile` — datos personales / avatar / referral_code
- `PUT /user/documents/{driver_license|tlc_license|profile_photo}` — multipart
- `GET|POST /user/vehicles`, `PUT /user/vehicles/{id}`,
  `PUT /user/vehicles/{id}/documents/{type}` (máx. 3 vehículos activos)
- `GET /admin/stats`, `/admin/users`, `/admin/user?id=`
- `POST /drivers/validate-photo`, `/drivers/validate-document` (visión/OCR)

Swagger crudo de referencia en `swaggerApiInfo.txt`. Ojo: el swagger expone
PATCH para profile/vehicles, pero el front usa **PUT a propósito** — PATCH falla
por CORS en el deploy actual (commit c1507b7).

## Convenciones

- Oro de marca `#D4AF37` (constante `GOLD` local en varias páginas).
- URLs de assets públicos **solo** desde `lib/assets.ts`. Hubo un segundo
  proyecto Supabase (`xhcxkvwrjcnioopultzq`) que fue borrado y dejó 404s; todo
  apunta ahora a `bglvvffnlgawlcfxctbl/public-resources`.
- Nunca `console.*` directo: usar `lib/logger.ts` (silencioso en prod salvo
  `error`) — el front maneja tokens, emails y referral codes.
- `AUDIT_FRONTEND.md` documenta la auditoría y qué se decidió **no** arreglar
  (tipos duplicados, signOut unificado); léelo antes de "limpiar" esas cosas.

## Tests

Vitest + Testing Library (jsdom). Config en `vitest.config.ts` (aparte de
`vite.config.ts`), setup en `src/test/setup.ts`. Los tests viven al lado del
código que prueban: `src/**/*.test.ts` / `.test.tsx`.

- `npm test` — corrida única. `npm run test:watch`. `npm run test:coverage`.
- `VITEST_VERBOSE=1 npm test` para ver los `console.*` del código (el setup los
  silencia porque varios tests recorren caminos de error a propósito).
- Las env vars de Supabase se inyectan desde `vitest.config.ts` (`test.env`),
  porque `lib/supabase.ts` lanza al importarse si faltan y `.env` está gitignored.
- Patrón para servicios: `vi.mock("@/lib/api")` y afirmar verbo + ruta + payload
  (ahí es donde se rompen las cosas: PUT vs PATCH, rutas, multipart).
- La lógica que vale la pena testear se extrae a `src/lib/` como funciones puras
  (ej. `vehiclePhotos.ts`, `postLoginRoute.ts`) en vez de montar el wizard de
  1600 líneas.

Cubierto hoy: ruteo post-login, interceptores de `api`, guards de ruta,
`auth`/`dashboard`/`vision` services y los slots de fotos del vehículo.

## Deuda conocida

- `RegisterDriver.tsx` (~1650 líneas) es un wizard monolítico con `formData: any`;
  tiparlo se pospuso a propósito por riesgo de cascada.
- ~17 errores de lint preexistentes en `components/ui/` y `tailwind.config.ts`.
- `ProfileDetailsModal` coordina subidas de documentos con un `CustomEvent`
  (`doc-upload`) en vez de props — frágil, pero es el patrón actual.
