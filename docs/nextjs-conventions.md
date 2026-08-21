# Next.js 16 Breaking Changes and New Conventions

This document contains ONLY what has changed in Next.js 16 compared to typical Next.js training data. For implementer agents who need to know what's different in THIS version (16.2.11) of Next.js.

**CRITICAL**: This project uses Next.js 16.2.11 with React 19.2.4. Many APIs and conventions differ from older versions.

---

## Runtime Requirements (BREAKING)

**Source**: `node_modules/next/dist/docs/01-app/02-guides/upgrading/version-16.md`

| Requirement   | Change |
| ------------- | ------ |
| Node.js       | **Minimum 20.9.0** (Node 18 no longer supported) |
| TypeScript    | **Minimum 5.1.0** |
| React         | **19.2+ required** (uses React Canary features) |
| Browsers      | Chrome 111+, Edge 111+, Firefox 111+, Safari 16.4+ |

---

## Build System: Turbopack Now Default (BREAKING)

**Source**: `node_modules/next/dist/docs/01-app/02-guides/upgrading/version-16.md`

### What Changed

Turbopack is **stable and default** for both `next dev` and `next build`. The `--turbopack` flag is no longer needed.

```json
// OLD (Next.js 15)
{
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build --turbopack"
  }
}

// NEW (Next.js 16)
{
  "scripts": {
    "dev": "next dev",
    "build": "next build"
  }
}
```

### Custom Webpack Configurations (BREAKING)

If you have a custom `webpack` configuration in `next.config.js`, **builds will fail** unless you:

1. Use `--webpack` flag: `next build --webpack`
2. Migrate to Turbopack config
3. Use `--turbopack` to ignore webpack config

### Configuration Location Changed

```ts
// OLD (Next.js 15)
const nextConfig = {
  experimental: {
    turbopack: {
      // options
    }
  }
}

// NEW (Next.js 16)
const nextConfig = {
  turbopack: {  // Top-level, no longer experimental
    // options
  }
}
```

### Sass Imports (BREAKING)

Tilde (`~`) prefix for node_modules imports is **no longer supported**:

```scss
/* OLD - No longer works */
@import '~bootstrap/dist/css/bootstrap.min.css';

/* NEW - Remove tilde */
@import 'bootstrap/dist/css/bootstrap.min.css';
```

---

## Async Request APIs (BREAKING)

**Source**: `node_modules/next/dist/docs/01-app/02-guides/upgrading/version-16.md`

ALL request-time APIs are now **async ONLY**. Synchronous access removed in v16.

### APIs Affected

- `cookies()`
- `headers()`
- `draftMode()`
- `params` (in layouts, pages, route handlers, metadata files)
- `searchParams` (in pages)

### Migration Pattern

```tsx
// OLD (Next.js 15 - synchronous)
export default function Page({ params, searchParams }) {
  const { slug } = params
  const { query } = searchParams
}

// NEW (Next.js 16 - async)
export default async function Page({ params, searchParams }) {
  const { slug } = await params
  const { query } = await searchParams
}
```

### Synchronous Components (use React.use())

```tsx
// For synchronous components that can't be async
'use client'
import { use } from 'react'

export default function Page({ params, searchParams }) {
  const resolvedParams = use(params)
  const resolvedSearchParams = use(searchParams)
  // ...
}
```

### Image Generation Functions (BREAKING)

`opengraph-image`, `twitter-image`, `icon`, `apple-icon` now receive async props:

```js
// OLD (Next.js 15)
export default function Image({ params, id }) {
  const slug = params.slug
  const imageId = id // string
}

// NEW (Next.js 16)
export default async function Image({ params, id }) {
  const { slug } = await params  // params is Promise
  const imageId = await id        // id is Promise<string>
}
```

### Sitemap `id` Parameter (BREAKING)

```js
// OLD (Next.js 15)
export default async function sitemap({ id }) {
  const start = id * 50000 // id is number
}

// NEW (Next.js 16)
export default async function sitemap({ id }) {
  const resolvedId = await id     // id is Promise<string>
  const start = Number(resolvedId) * 50000
}
```

---

## Middleware Renamed to Proxy (BREAKING)

**Source**: `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md`

### File Name Change

```bash
# OLD
middleware.ts / middleware.js

# NEW
proxy.ts / proxy.js
```

### Function Name Change

```ts
// OLD
export function middleware(request) { }

// NEW
export function proxy(request) { }
```

### Config Options Renamed

```ts
// OLD
export const config = {
  skipMiddlewareUrlNormalize: true
}

// NEW
export const config = {
  skipProxyUrlNormalize: true
}
```

### Edge Runtime Removed (BREAKING)

`proxy.ts` **ONLY supports Node.js runtime**. The `edge` runtime is **NOT supported**.

```ts
// REMOVED - No longer works
export const runtime = 'edge'  // Error!
```

If you need edge behavior, keep using `middleware.ts` (deprecated but still works for edge runtime until further notice).

---

## Caching Model: Cache Components (NEW)

**Source**: `node_modules/next/dist/docs/01-app/02-guides/migrating-to-cache-components.md`

### Fundamental Shift

Next.js 16 introduces **Cache Components** as the primary caching model. This replaces route segment configs.

Enable with:

```ts
// next.config.ts
const nextConfig = {
  cacheComponents: true
}
```

### Default Behavior Changes (BREAKING)

1. **All pages are dynamic by default** (no longer static by default)
2. **`fetch()` is NOT cached by default** (was cached in v15)
3. **Route handlers (GET) are NOT cached by default**

### Route Segment Configs Deprecated

These are **replaced by `use cache` directive**:

- `export const dynamic = 'force-static'` ❌
- `export const dynamic = 'force-dynamic'` ❌ (not needed, dynamic by default)
- `export const revalidate = 3600` ❌
- `export const fetchCache = 'force-cache'` ❌

### New Caching Directive: `use cache`

**Source**: `node_modules/next/dist/docs/01-app/03-api-reference/01-directives/use-cache.md`

```tsx
// File level
'use cache'
export default async function Page() { }

// Component level
async function MyComponent() {
  'use cache'
  return <div>Cached</div>
}

// Function level
async function getData() {
  'use cache'
  const data = await fetch('/api/data')
  return data
}
```

### Cache Control Functions

Replace `revalidate` and `tags` with:

```ts
import { cacheLife, cacheTag } from 'next/cache'

async function getData() {
  'use cache'
  cacheLife('hours')     // Built-in profiles: default, seconds, minutes, hours, days, weeks, max
  cacheTag('products')   // For on-demand revalidation
  return fetch('/api/data')
}
```

### Fetch Caching Pattern Changed

```ts
// OLD (Next.js 15)
const data = await fetch('https://...', {
  cache: 'force-cache',
  next: { revalidate: 3600, tags: ['data'] }
})

// NEW (Next.js 16 with Cache Components)
import { cacheLife, cacheTag } from 'next/cache'

async function getData() {
  'use cache'
  cacheLife('hours')
  cacheTag('data')
  const res = await fetch('https://...')
  return res.json()
}
```

### unstable_cache Replaced

```ts
// OLD
import { unstable_cache } from 'next/cache'
const getUser = unstable_cache(
  async (id) => db.query(id),
  ['user'],
  { tags: ['users'], revalidate: 3600 }
)

// NEW
import { cacheLife, cacheTag } from 'next/cache'
async function getUser(id) {
  'use cache'
  cacheLife('hours')
  cacheTag('users')
  return db.query(id)
}
```

---

## Revalidation APIs Changed (BREAKING)

**Source**: `node_modules/next/dist/docs/01-app/02-guides/upgrading/version-16.md`

### revalidateTag Now Requires Second Argument

```ts
// OLD (Next.js 15)
revalidateTag('posts')

// NEW (Next.js 16) - REQUIRED second argument
revalidateTag('posts', 'max')  // Stale-while-revalidate
```

### New: updateTag (for immediate updates)

For mutations where users must see their change immediately:

```ts
'use server'
import { updateTag } from 'next/cache'

export async function updateUserProfile(userId, profile) {
  await db.users.update(userId, profile)
  updateTag(`user-${userId}`)  // Expires cache immediately, no stale content
}
```

**When to use**:
- `updateTag`: User must see their change immediately (read-your-writes)
- `revalidateTag`: Stale-while-revalidate is acceptable (content updates, blog posts)

### New: refresh

Refresh client router from Server Action:

```ts
'use server'
import { refresh } from 'next/cache'

export async function markNotificationAsRead(notificationId) {
  await db.notifications.markAsRead(notificationId)
  refresh()  // Refresh the client router
}
```

### Stable: cacheLife and cacheTag

Remove `unstable_` prefix:

```ts
// OLD
import { unstable_cacheLife as cacheLife } from 'next/cache'

// NEW
import { cacheLife, cacheTag } from 'next/cache'
```

---

## Partial Prerendering (PPR) Configuration Changed

**Source**: `node_modules/next/dist/docs/01-app/02-guides/upgrading/version-16.md`

```js
// OLD (Next.js 15 canary)
const nextConfig = {
  experimental: {
    ppr: true
  }
}

// Also removed:
export const experimental_ppr = true  // Route segment config

// NEW (Next.js 16)
const nextConfig = {
  cacheComponents: true  // Enables PPR + more
}
```

**If using PPR today**: Stay on Next.js 15 canary until migration is complete.

---

## next/image Changes (BREAKING)

**Source**: `node_modules/next/dist/docs/01-app/02-guides/upgrading/version-16.md`

### Local Images with Query Strings

Now require explicit configuration:

```tsx
// This now requires config:
<Image src="/assets/photo?v=1" alt="Photo" width={100} height={100} />

// next.config.ts
const nextConfig = {
  images: {
    localPatterns: [{
      pathname: '/assets/**',
      search: '?v=1'
    }]
  }
}
```

### minimumCacheTTL Default Changed

```ts
// OLD default: 60 seconds
// NEW default: 14400 seconds (4 hours)

// To restore old behavior:
const nextConfig = {
  images: {
    minimumCacheTTL: 60
  }
}
```

### imageSizes Default Changed

Value `16` removed from default array:

```ts
// OLD default: [16, 32, 48, 64, 96, 128, 256, 384]
// NEW default: [32, 48, 64, 96, 128, 256, 384]

// To restore:
const nextConfig = {
  images: {
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384]
  }
}
```

### qualities Default Changed

```ts
// OLD default: All qualities
// NEW default: [75] only

// To support multiple:
const nextConfig = {
  images: {
    qualities: [50, 75, 100]
  }
}
```

### Local IP Restriction (BREAKING)

Local IP optimization blocked by default:

```ts
// Required for private networks:
const nextConfig = {
  images: {
    dangerouslyAllowLocalIP: true  // Only for private networks
  }
}
```

### Maximum Redirects Changed

```ts
// OLD default: unlimited
// NEW default: 3 redirects maximum

// To change:
const nextConfig = {
  images: {
    maximumRedirects: 0,  // Disable
    // or
    maximumRedirects: 5   // Increase
  }
}
```

### images.domains Deprecated

```js
// OLD (deprecated)
module.exports = {
  images: {
    domains: ['example.com']
  }
}

// NEW
module.exports = {
  images: {
    remotePatterns: [{
      protocol: 'https',
      hostname: 'example.com'
    }]
  }
}
```

### next/legacy/image Deprecated

```tsx
// OLD
import Image from 'next/legacy/image'

// NEW
import Image from 'next/image'
```

---

## Development and Build Changes

**Source**: `node_modules/next/dist/docs/01-app/02-guides/upgrading/version-16.md`

### Concurrent dev and build

`next dev` now outputs to `.next/dev` (not `.next`), enabling concurrent dev and build.

Lockfiles prevent multiple instances of same command.

### Build Output Changes

`size` and `First Load JS` metrics **removed** from `next build` output (found to be inaccurate for RSC).

Use Chrome Lighthouse or Vercel Analytics for actual performance metrics.

### next dev Config Loading

Config file no longer loaded when running `next dev` command (only when server starts).

**Impact**: `process.argv.includes('dev')` in `next.config.js` now returns `false`.

```js
// OLD - Doesn't work
if (process.argv.includes('dev')) { }

// NEW - Use NODE_ENV
if (process.env.NODE_ENV === 'development') { }

// Or use phase
const { PHASE_DEVELOPMENT_SERVER } = require('next/constants')
module.exports = (phase) => {
  if (phase === PHASE_DEVELOPMENT_SERVER) { }
}
```

---

## Parallel Routes: default.js Required (BREAKING)

**Source**: `node_modules/next/dist/docs/01-app/02-guides/upgrading/version-16.md`

All parallel route slots **MUST have explicit `default.js` files**. Builds fail without them.

```tsx
// app/@modal/default.tsx (REQUIRED)
import { notFound } from 'next/navigation'

export default function Default() {
  notFound()  // or return null
}
```

---

## ESLint Changes (BREAKING)

**Source**: `node_modules/next/dist/docs/01-app/02-guides/upgrading/version-16.md`

### next lint Command Removed

```json
// OLD
{
  "scripts": {
    "lint": "next lint"
  }
}

// NEW - Use ESLint directly
{
  "scripts": {
    "lint": "eslint"
  }
}
```

**Codemod available**: `npx @next/codemod@canary next-lint-to-eslint-cli .`

### ESLint Config Changed

`@next/eslint-plugin-next` now defaults to **ESLint Flat Config** format (aligned with ESLint v10).

### eslint Option Removed from next.config.js

```js
// OLD - No longer supported
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true
  }
}

// ESLint config now managed independently
```

---

## Scroll Behavior Changed

**Source**: `node_modules/next/dist/docs/01-app/02-guides/upgrading/version-16.md`

Next.js **no longer overrides** `scroll-behavior: smooth` during navigation by default.

```tsx
// To restore old behavior (override smooth scrolling):
export default function RootLayout({ children }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  )
}
```

---

## UI State Preservation (NEW)

**Source**: `node_modules/next/dist/docs/01-app/02-guides/migrating-to-cache-components.md`

With Cache Components, component state **persists across navigations** using React `<Activity>` component.

### What Persists

- `useState` values
- Form inputs
- Scroll position

### Impact

Code that relied on unmounting to clear state needs explicit reset logic:

```tsx
// Dropdowns/popovers: Add cleanup
useLayoutEffect(() => {
  return () => setIsOpen(false)  // Close on navigation
}, [])

// Forms: Reset in submit handler or use URL-based state
```

---

## Removals

**Source**: `node_modules/next/dist/docs/01-app/02-guides/upgrading/version-16.md`

### AMP Support Removed

```tsx
// REMOVED - All of these
import { useAmp } from 'next/amp'
export const config = { amp: true }

const nextConfig = {
  amp: { canonicalBase: 'https://example.com' }
}
```

### Runtime Configuration Removed

```js
// REMOVED
module.exports = {
  serverRuntimeConfig: { dbUrl: process.env.DATABASE_URL },
  publicRuntimeConfig: { apiUrl: '/api' }
}

// Use environment variables instead:
// Server-only: process.env.DATABASE_URL (in Server Components)
// Client-accessible: NEXT_PUBLIC_API_URL (prefix with NEXT_PUBLIC_)
```

For runtime reads (not bundled at build):

```tsx
import { connection } from 'next/server'

export default async function Page() {
  await connection()
  const config = process.env.RUNTIME_CONFIG
  return <p>{config}</p>
}
```

### devIndicators Options Removed

```js
// REMOVED
const nextConfig = {
  devIndicators: {
    appIsrStatus: true,
    buildActivity: true,
    buildActivityPosition: 'bottom-right'
  }
}
```

### experimental.dynamicIO and experimental.useCache Removed

```js
// REMOVED
const nextConfig = {
  experimental: {
    dynamicIO: true,
    useCache: true
  }
}

// Use top-level cacheComponents instead:
const nextConfig = {
  cacheComponents: true
}
```

### unstable_rootParams Removed

The `unstable_rootParams` function has been removed. Alternative API coming in future release.

---

## React 19 Features Available

**Source**: `node_modules/next/dist/docs/01-app/02-guides/upgrading/version-16.md`

Next.js 16 uses React 19.2+ (Canary) which includes:

- **View Transitions**: `ViewTransition` for animating elements
- **useEffectEvent**: Extract non-reactive logic from Effects
- **Activity**: Render background UI with `display: none` while maintaining state

**Important**: App Router uses React Canary releases built-in. Pages Router uses React version in package.json.

---

## React Compiler Support (Stable)

**Source**: `node_modules/next/dist/docs/01-app/02-guides/upgrading/version-16.md`

```ts
// No longer experimental
const nextConfig = {
  reactCompiler: true  // Not enabled by default
}
```

Install: `pnpm add -D babel-plugin-react-compiler`

**Note**: Compile times will be higher when enabled (relies on Babel).

---

## File Conventions Reference

**Source**: `node_modules/next/dist/docs/01-app/01-getting-started/02-project-structure.md`

### Top-Level Files

| File | Purpose |
| ---- | ------- |
| `proxy.ts` | Next.js request proxy (was middleware.ts) |
| `eslint.config.mjs` | ESLint configuration (Flat Config format) |

### App Router Special Files

All routing files support `.js`, `.jsx`, `.tsx` extensions:

| File | Purpose |
| ---- | ------- |
| `layout` | Layout (wraps children) |
| `page` | Page (public route) |
| `loading` | Loading UI |
| `not-found` | Not found UI |
| `error` | Error UI |
| `global-error` | Global error UI |
| `route` | API endpoint (`.js` `.ts` only) |
| `template` | Re-rendered layout |
| `default` | Parallel route fallback |
| `forbidden` | Forbidden UI (canary) |
| `unauthorized` | Unauthorized UI (canary) |

### Dynamic Routes

| Pattern | URL Pattern |
| ------- | ----------- |
| `[slug]` | `/blog/a` |
| `[...slug]` | `/shop/a/b/c` (catch-all) |
| `[[...slug]]` | `/docs`, `/docs/a/b` (optional catch-all) |

### Route Groups and Private Folders

| Pattern | Behavior |
| ------- | -------- |
| `(group)` | Organizational folder (not in URL) |
| `_folder` | Private folder (not routable) |

### Parallel and Intercepted Routes

| Pattern | Purpose |
| ------- | ------- |
| `@slot` | Named slot for parallel routes |
| `(.)folder` | Intercept same level |
| `(..)folder` | Intercept parent level |
| `(..)(..)folder` | Intercept two levels up |
| `(...)folder` | Intercept from root |

---

## Critical API Changes Summary

### APIs That Are Now Async (BREAKING)

```ts
// All of these are now async ONLY:
await cookies()
await headers()
await draftMode()
await params
await searchParams
```

### New Directives

```ts
'use cache'           // Mark component/function as cacheable
'use cache: remote'   // Use remote cache handler
'use cache: private'  // Allow runtime data in cache
'use server'          // Server Actions (unchanged)
'use client'          // Client Components (unchanged)
```

### New Cache Functions

```ts
import { cacheLife, cacheTag, updateTag, refresh } from 'next/cache'

cacheLife('hours')    // Set cache duration
cacheTag('products')  // Tag for revalidation
updateTag('products') // Immediate expiration
refresh()             // Refresh client router
```

### Changed Functions

```ts
// revalidateTag now requires second argument
revalidateTag('posts', 'max')

// revalidatePath unchanged
revalidatePath('/blog')
```

---

## Migration Checklist

For implementers working in this codebase:

1. ✅ **All route handlers**: Treat `params` and `searchParams` as promises, use `await`
2. ✅ **cookies/headers calls**: Always `await cookies()` and `await headers()`
3. ✅ **Caching**: Use `'use cache'` directive instead of route segment configs
4. ✅ **Revalidation**: Use `revalidateTag(tag, profile)` with two arguments
5. ✅ **Images**: Check if using query strings in local images (requires config)
6. ✅ **Middleware**: Use `proxy.ts` (not `middleware.ts`) with Node.js runtime
7. ✅ **Parallel routes**: Ensure all `@slot` folders have `default.js`
8. ✅ **ESLint**: Use `eslint` command directly (not `next lint`)
9. ✅ **Scripts**: Remove `--turbopack` flags from package.json
10. ✅ **Imports**: No `unstable_` prefix for `cacheLife`, `cacheTag`

---

## Common Errors and Fixes

### "Cannot access params/searchParams synchronously"

```tsx
// ❌ Wrong
export default function Page({ params }) {
  const { id } = params  // Error!
}

// ✅ Correct
export default async function Page({ params }) {
  const { id } = await params
}
```

### "revalidateTag requires 2 arguments"

```ts
// ❌ Wrong
revalidateTag('posts')

// ✅ Correct
revalidateTag('posts', 'max')
```

### "Build failed: webpack config found"

```bash
# Option 1: Use webpack
next build --webpack

# Option 2: Use turbopack (ignore webpack config)
next build --turbopack
```

### "Parallel route missing default.js"

```tsx
// Create app/@modal/default.tsx
export default function Default() {
  return null
}
```

---

## Documentation References

All information extracted from:
- `node_modules/next/dist/docs/01-app/02-guides/upgrading/version-16.md`
- `node_modules/next/dist/docs/01-app/02-guides/upgrading/version-15.md`
- `node_modules/next/dist/docs/01-app/02-guides/migrating-to-cache-components.md`
- `node_modules/next/dist/docs/01-app/03-api-reference/01-directives/use-cache.md`
- `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md`
- `node_modules/next/dist/docs/01-app/01-getting-started/02-project-structure.md`

**Last Updated**: Based on Next.js 16.2.11
