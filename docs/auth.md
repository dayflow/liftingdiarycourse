# Auth Standards

## Provider

This app uses **Clerk** for authentication. Do not implement custom auth or use any other auth library (NextAuth, Auth.js, etc.).

Install: `@clerk/nextjs`

## ClerkProvider

`<ClerkProvider>` must wrap the entire app. It lives in `app/layout.tsx` and should not be moved or duplicated.

## Protecting Routes (Server Components)

Use `auth()` from `@clerk/nextjs/server` in Server Components and page files to get the current user's ID. Always redirect unauthenticated users — never render protected content without checking auth first.

```ts
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export default async function ProtectedPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  // safe to fetch user data here
}
```

Never use `auth()` in Client Components — it is a server-only API.

## Middleware (proxy.ts)

Route protection at the middleware level is configured in `proxy.ts` (not `middleware.ts` — Next.js 16 uses `proxy.ts`). The current setup runs `clerkMiddleware` on all routes except static assets. Do not rename or move this file.

To make a route require authentication at the middleware level, use `auth().protect()` inside the middleware callback:

```ts
import { clerkMiddleware } from '@clerk/nextjs/server'

export default clerkMiddleware(async (auth, req) => {
  // protect all routes under /dashboard
  if (req.nextUrl.pathname.startsWith('/dashboard')) {
    await auth.protect()
  }
})
```

## UI Components

Use Clerk's pre-built UI components for auth flows. Do not build custom sign-in/sign-up forms.

| Component | Usage |
|-----------|-------|
| `<SignInButton mode="modal">` | Triggers sign-in modal |
| `<SignUpButton mode="modal">` | Triggers sign-up modal |
| `<UserButton>` | User avatar + account menu |
| `<Show when="signed-in">` | Conditionally render for signed-in users |
| `<Show when="signed-out">` | Conditionally render for signed-out users |

These are all imported from `@clerk/nextjs`.

## Accessing the User ID

The authenticated user's ID is always sourced from Clerk — never store it separately or derive it from another source.

- **Server Components / pages:** `const { userId } = await auth()` from `@clerk/nextjs/server`
- **Client Components:** `const { userId } = useAuth()` from `@clerk/nextjs`

Pass `userId` down as a prop from Server Components to Client Components when needed — do not call `useAuth()` just to avoid prop-drilling if a Server Component parent already has the ID.

## User Data Isolation

Every database query for user-owned data must filter by `userId`. See `docs/data-fetching.md` for the full standard. The short rule: never fetch rows without a `WHERE userId = ?` clause.

## Environment Variables

Clerk requires two environment variables. These must never be committed to the repo:

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
```

Only `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` is exposed to the client bundle. `CLERK_SECRET_KEY` is server-only and must never be referenced in Client Components or passed to the browser.
