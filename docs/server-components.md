# Server Components Standards

## Params Must Be Awaited

In Next.js 16, `params` in dynamic routes is a **Promise**. You must `await` it before accessing any properties.

```tsx
// ✅ Correct
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
}

// ❌ Wrong — params is a Promise, id will be undefined
export default function Page({ params }: { params: { id: string } }) {
  const { id } = params
}
```

This applies to all dynamic route segments, including nested ones:

```tsx
// app/dashboard/workout/[id]/page.tsx
export default async function EditWorkoutPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
}
```

## searchParams Must Be Awaited

The same rule applies to `searchParams` — it is also a Promise in Next.js 16:

```tsx
// ✅ Correct
export default async function Page({ searchParams }: { searchParams: Promise<{ date: string }> }) {
  const { date } = await searchParams
}
```

## Server Components Are Async by Default

Always declare page and layout Server Components as `async` functions. This is required to use `await` for params, searchParams, data fetching, and auth.

```tsx
// ✅ Correct
export default async function Page() {
  const { userId } = await auth()
  const data = await getData()
}
```

## No Client APIs in Server Components

Server Components run on the server — never use browser or React client APIs in them:

- No `useState`, `useEffect`, `useRef`, or any other hooks
- No `window`, `document`, or other browser globals
- No `useRouter`, `useSearchParams`, or other client-side Next.js hooks
- No `useAuth()` from Clerk — use `auth()` from `@clerk/nextjs/server` instead

If you need any of these, move that logic into a Client Component (`'use client'`) and pass data down as props from the Server Component parent.
