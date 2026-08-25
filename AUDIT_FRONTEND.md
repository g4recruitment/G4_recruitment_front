# Auditoría del Frontend — G4 Drivers

> Análisis realizado con `/vercel-react-best-practices` el 2026-06-16.
> Stack real: **Vite SPA + React 18 + shadcn/ui** (no Next.js — las reglas server/RSC no aplican).
> Ámbito: `frontend/src/**` (excluyendo `components/ui/` generado por shadcn).

> **Estado 2026-07-15 — Tier 1 + Tier 2 + Tier 3 RESUELTOS** (build verde):
> - ✅ #1 route guards → `components/ProtectedRoute.tsx` (`ProtectedRoute`/`AdminRoute`), aplicados en `App.tsx`.
> - ✅ #2 logging sensible → nuevo `lib/logger.ts` (DEV-only); removidas fugas de token keys en `AuthCallback`.
> - ✅ #3 fail-fast en `lib/supabase.ts` (lanza si faltan env vars).
> - ✅ #6 code-splitting → `React.lazy` + `<Suspense>` para páginas pesadas (RegisterDriver/AdminDashboard/UserProfile/legales).
> - ✅ #9 QueryClient con defaults (`staleTime`, `refetchOnWindowFocus:false`, `retry:1`).
> - ✅ #7 `Header` inline sacado a `RegisterHeader` de módulo.
> - ✅ #5 constantes de assets → `lib/assets.ts` (logo dorado, corolla, escalade, hero); reemplazado en 8 archivos.
> - ✅ #8/#10 `fetch`→axios `api` en `vision.service` y el registro de `RegisterDriver` (token + 401 centralizados).
> - ✅ #11 `resolvePostLoginRoute()` en `lib/postLoginRoute.ts`, usado en `Login` y `AuthCallback`. **Corrige bug latente:** AuthCallback priorizaba `pendingType` sobre `exists`, mandando usuarios ya registrados de vuelta a registro si quedaba un `pendingDriverType` viejo en localStorage.
> - ✅ #12 `ParticlesBackground` parametrizado con `CONFIGS` por variante (~100 líneas menos, animación idéntica).
> - ✅ #15 (parcial) `additional_info`, `stats as any`, `additionalInfo` tipados; 2 `prefer-const`. Los `any` de `formData` en RegisterDriver se dejaron (tiparlos arriesga cascada en archivo de 1600 líneas; no bloquean build).
> - ✅ #16 `validateFormalWear` (muerto) eliminado; debug sensible de AuthCallback ya saneado en Tier 1.
> - ✅ #17 `DocumentUploadField` → un solo `useState<FileEntry[]>` con `id` estable. **Corrige bug latente:** subir varios archivos a la vez desincronizaba `files`/`previewUrls` (loop sobre `addFile` con closure stale).
>
> **NO aplicados (con criterio):**
> - #13 centralizar tipos — los `ReferralItem` y `UserApplicationDetails`/`DriverApplication` **difieren en campos reales** entre admin y dashboard; fusionarlos rompería tipado sin beneficio.
> - #14 `signOut` unificado — `useAuth().signOut()` redirige a `/login` pero `RegisterDriver` va a `/` a propósito; cambio de UX por bajo valor.
>
> Lint restante (17 errores) = deuda pre-existente: `components/ui/` generado (shadcn), `tailwind.config.ts`, y `formData`/misc anys fuera de alcance.

## Resumen de prioridades

| # | Tema | Severidad | Esfuerzo |
|---|------|-----------|----------|
| 1 | Route guards admin/profile | Alta | Medio |
| 2 | Logging de tokens/emails en AuthCallback | Alta | Bajo |
| 6 | Code-splitting por ruta | Media-alta | Bajo |
| 8/10 | Unificar `fetch` → axios `api` | Media | Bajo |
| 5/11/12 | Constantes + dedup redirección/partículas | Media | Medio |
| 7 | `Header` inline en RegisterDriver | Media | Bajo |

> Nada es crítico-explotable en el front (el backend con JWT middleware es la verdadera barrera), pero **#1 y #2 son los primeros a cerrar**.

---

## 🔴 Seguridad

### 1. No hay route guards en el cliente — `App.tsx`
`/admin`, `/profile`, `/register/*` se renderizan para cualquiera. La protección real es solo el backend (el middleware JWT rechaza las requests), así que **no hay fuga de datos**, pero:
- El shell del `AdminDashboard` se monta y dispara queries aunque no seas admin.
- No hay defensa en profundidad ni redirección limpia. Si el backend fallara abierto, quedaría expuesto.
- **Recomendado:** un `<ProtectedRoute>` / `<AdminRoute>` que use `useAuth()` + el rol de `checkUserExists`.

### 2. Logging verboso en producción — 40 `console.*` en 9 archivos
`AuthCallback.tsx` es el peor caso: imprime en consola eventos de auth, emails, y **muestra en pantalla** (`setDetails`) las keys de los tokens OAuth y mensajes de error del provider (líneas 29, 64, 79, 91, 214). `auth.service.ts` loguea el response completo de `/user/me` y los referral codes.
- **Recomendado:** envolver tras `import.meta.env.DEV` o eliminar.

### 3. Cliente Supabase falla silencioso — `lib/supabase.ts:11`
`createClient(supabaseUrl || '', supabaseAnonKey || '')` — si faltan las env vars solo hace `console.warn` y crea un cliente roto que falla de forma opaca en runtime.
- **Recomendado:** lanzar el error en arranque.

### 4. Flag `isAdminLoginAttempt` en localStorage
Controlado por el cliente, pero la decisión real (`role === 'admin'`) viene del backend, así que es correcto. Solo dejarlo documentado.

---

## 🟠 Claves / config hardcodeada

### 5. DOS project URLs de Supabase repartidas por todo el front
- `xhcxkvwrjcnioopultzq.supabase.co` (logos, corolla, fleet) — en Login, Index, AdminDashboard, Footer, LegalLayout, LegacyHeader, OurFleet
- `bglvvffnlgawlcfxctbl.supabase.co` (escalade) — en Login, Index, RegisterDriver

No son secretos (buckets públicos), pero es **config dispersa**. La URL del logo `G4_GOLD_brand.webp` está copiada literal en **5 archivos**. Además hay dominios externos (`unsplash.com`, `transparenttextures.com`, `placehold.co`) como dependencias de disponibilidad.
- **Recomendado:** constantes en `src/lib/assets.ts` (o derivarlas de `VITE_SUPABASE_URL`).

---

## 🟡 Optimización

### 6. Cero code-splitting
Todo (RegisterDriver de **1641 líneas**, AdminDashboard, framer-motion, recharts) entra en el bundle inicial.
- **Recomendado:** rutas como `React.lazy()` + `<Suspense>`. *(regla `bundle-dynamic-imports`)*

### 7. Componente definido dentro del render — `RegisterDriver.tsx:819`
`const Header = () => (...)` se recrea en cada render → React lo remonta cada vez (pierde estado, parpadeos).
- **Recomendado:** sacarlo fuera del componente. *(regla `rerender-no-inline-components`)*

### 8. `fetch` crudo en vez del axios compartido
`RegisterDriver.tsx:776` y `vision.service.ts` (x2) hacen `getSession()` + `Authorization` a mano, **duplicando** el interceptor de `api.ts` y **saltándose** el manejo global del 401.
- **Recomendado:** usar `api`.

### 9. QueryClient sin config — `App.tsx:19`
Sin `staleTime`, refetch agresivo on-focus.
- **Recomendado:** definir defaults razonables.

---

## 🔵 Reutilización / redundancia

### 10. Patrón de token duplicado en 4 sitios
Interceptor de `api.ts`, `vision.service` (x2), `RegisterDriver`. Unificar en `api`.

### 11. Lógica de redirección post-login duplicada
El branching `isAdminLoginAttempt → admin/pending/exists` está **casi idéntico** en `Login.tsx:46-87` y `AuthCallback.tsx:136-208`.
- **Recomendado:** extraer a un helper `resolvePostLoginRoute()`.

### 12. `ParticlesBackground.tsx` — ramas casi idénticas
`luxury` y `comfort` son ~95% iguales (orbs + dust); solo cambian colores y counts. ~100 líneas duplicadas.
- **Recomendado:** parametrizar con un objeto de config por tipo.

### 13. Interfaces duplicadas
`ReferralItem` existe en `admin.service` y `dashboard.service`; `UserApplicationDetails` (admin) ≈ `DriverApplication` (dashboard) casi campo por campo.
- **Recomendado:** centralizar en `src/types/`.

### 14. `signOut`/`handleLogout` repetido
En RegisterDriver, AdminDashboard y AuthProvider. Ya existe `useAuth().signOut()` — usarlo en todos.

### 15. `as any` rompiendo el tipado
`(stats as any)` (AdminDashboard:117), `additional_info: any`, `additionalInfo: any`. Tipar correctamente.

### 16. Código muerto
`visionService.validateFormalWear` está marcado `@deprecated` y solo hace `return true`; el UI de debug de `AuthCallback` debería retirarse en prod.

### 17. `DocumentUploadField` — 4 arrays paralelos
Maneja `files`, `previewUrls`, `validations`, `validationErrors` sincronizados a mano en cada operación. Frágil.
- **Recomendado:** un único `useState<FileEntry[]>`.
