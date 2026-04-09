# Data Fetching Standards

## Server Components Only

**All data fetching must be done exclusively via React Server Components.** This is a hard rule — no exceptions.

Do NOT fetch data via:
- Route handlers (`app/api/*/route.ts`)
- Client components (`'use client'`)
- `useEffect` or any other client-side mechanism
- Third-party data fetching libraries (SWR, React Query, etc.)

Server Components fetch data directly by calling helper functions from the `/data` directory and passing the results down as props to any Client Components that need them.

## Database Queries via `/data` Helpers

All database queries must go through helper functions in the `/data` directory. Do not write raw SQL or inline Drizzle queries in components.

```
data/
  workouts.ts      # e.g. getWorkoutsForDate(), createWorkout()
  exercises.ts     # e.g. getExercises()
```

Helper functions must use **Drizzle ORM** exclusively. Raw SQL is not permitted.

```ts
// data/workouts.ts
import { db } from '@/db'
import { workouts } from '@/db/schema'
import { eq, and } from 'drizzle-orm'

export async function getWorkoutsForDate(userId: string, date: Date) {
  return db
    .select()
    .from(workouts)
    .where(and(eq(workouts.userId, userId), eq(workouts.date, date)))
}
```

## User Data Isolation

**A logged-in user must only ever be able to access their own data.** This is a critical security requirement.

Every query that returns user data must filter by the authenticated user's ID. Never fetch all rows and filter in application code — always filter at the database level.

```ts
// In your Server Component
import { auth } from '@clerk/nextjs/server'
import { getWorkoutsForDate } from '@/data/workouts'

export default async function DashboardPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const workouts = await getWorkoutsForDate(userId, new Date())
  // ...
}
```

The `userId` from Clerk must be passed into every data helper that touches user-owned data. Helper functions must always include a `userId` parameter and apply it as a `WHERE` clause — never omit it.
