# Routing Standards

## Route Structure

All application routes live under `/dashboard`. There are no top-level user-facing pages outside of auth flows (e.g., `/sign-in`).

```
/dashboard                        # Dashboard home
/dashboard/workout/new            # Create a new workout
/dashboard/workout/[id]           # View/edit a workout
```

Do not create routes outside of `/dashboard` for app functionality.

## Route Protection

All `/dashboard` routes are protected — they require the user to be authenticated.

Route protection is enforced at the **middleware level** using `proxy.ts` (not `middleware.ts` — Next.js 16 uses `proxy.ts`). Do not rely solely on per-page `auth()` checks to protect dashboard routes.

```ts
// proxy.ts
import { clerkMiddleware } from '@clerk/nextjs/server'

export default clerkMiddleware(async (auth, req) => {
  if (req.nextUrl.pathname.startsWith('/dashboard')) {
    await auth.protect()
  }
})
```

Unauthenticated users hitting any `/dashboard` route will be redirected to the Clerk sign-in page automatically via `auth.protect()`.

## Do Not Duplicate Protection Logic

Because middleware already protects `/dashboard`, do not add redundant `if (!userId) redirect(...)` checks in every page file. The middleware is the single source of truth for route-level auth. Per-page `auth()` calls are only needed to retrieve the `userId` for data fetching — not to re-implement the redirect guard.

## Dynamic Routes

Dynamic route segments follow the Next.js App Router convention. The `params` prop is a `Promise` in Next.js 16 and must be awaited:

```tsx
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
}
```

See `docs/server-components.md` for more on async Server Component conventions.
