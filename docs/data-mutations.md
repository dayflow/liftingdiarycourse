# Data Mutations Standards

## Server Actions Only

**All data mutations must be done exclusively via Server Actions.** This is a hard rule — no exceptions.

Do NOT mutate data via:
- Route handlers (`app/api/*/route.ts`)
- Client components directly calling the database
- Any client-side mechanism

## Colocated `actions.ts` Files

Server Actions must live in colocated `actions.ts` files — placed alongside the page or component that uses them, not in a shared global file.

```
app/
  workouts/
    page.tsx
    actions.ts    # Server Actions for the workouts page
  dashboard/
    page.tsx
    actions.ts    # Server Actions for the dashboard page
```

Each `actions.ts` file must have `'use server'` at the top.

```ts
'use server'

// actions.ts
```

## Typed Parameters — No FormData

All Server Action parameters must be explicitly typed. **`FormData` is not permitted as a parameter type.**

```ts
// ✅ Correct
export async function createWorkout(input: CreateWorkoutInput) { ... }

// ❌ Wrong
export async function createWorkout(formData: FormData) { ... }
```

## Zod Validation

All Server Actions must validate their arguments with [Zod](https://zod.dev/) before doing anything else. Never trust input from the client.

```ts
'use server'

import { z } from 'zod'

const createWorkoutSchema = z.object({
  name: z.string().min(1),
  date: z.date(),
})

type CreateWorkoutInput = z.infer<typeof createWorkoutSchema>

export async function createWorkout(input: CreateWorkoutInput) {
  const parsed = createWorkoutSchema.safeParse(input)
  if (!parsed.success) {
    throw new Error('Invalid input')
  }

  await insertWorkout(parsed.data.name, parsed.data.date)
}
```

## Database Mutations via `/data` Helpers

All database writes must go through helper functions in the `/data` directory. Do not write inline Drizzle calls inside Server Actions.

```
data/
  workouts.ts    # e.g. insertWorkout(), deleteWorkout(), updateWorkout()
```

Helper functions must use **Drizzle ORM** exclusively. Raw SQL is not permitted.

```ts
// data/workouts.ts
import { db } from '@/db'
import { workouts } from '@/db/schema'

export async function insertWorkout(userId: string, name: string, date: Date) {
  return db.insert(workouts).values({ userId, name, date })
}
```

Server Actions call these helpers after validation:

```ts
// app/workouts/actions.ts
'use server'

import { z } from 'zod'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { insertWorkout } from '@/data/workouts'

const createWorkoutSchema = z.object({
  name: z.string().min(1),
  date: z.date(),
})

type CreateWorkoutInput = z.infer<typeof createWorkoutSchema>

export async function createWorkout(input: CreateWorkoutInput) {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const parsed = createWorkoutSchema.safeParse(input)
  if (!parsed.success) {
    throw new Error('Invalid input')
  }

  await insertWorkout(userId, parsed.data.name, parsed.data.date)
}
```

## No Redirects in Server Actions

**Do not call `redirect()` inside Server Actions.** Redirects must be handled client-side after the Server Action call resolves.

Return a value from the Server Action (e.g. the created record's ID or a destination path) and use the Next.js router in the Client Component to navigate:

```ts
// app/dashboard/workout/new/actions.ts
'use server'

export async function createWorkout(input: CreateWorkoutInput) {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthenticated')

  const parsed = createWorkoutSchema.safeParse(input)
  if (!parsed.success) throw new Error('Invalid input')

  const workout = await insertWorkout(userId, parsed.data.startedAt, parsed.data.notes ?? null)
  return workout.id  // return data, don't redirect
}
```

```ts
// Client Component
import { useRouter } from 'next/navigation'

const router = useRouter()

async function handleSubmit() {
  const workoutId = await createWorkout(input)
  router.push(`/dashboard`)  // redirect happens client-side
}
```

This keeps Server Actions focused on data work and gives the client full control over navigation.

## User Data Isolation

The same user data isolation rules from `data-fetching.md` apply to mutations. Every write must be scoped to the authenticated user's ID — never allow a user to mutate another user's data.

The `userId` from Clerk must always be obtained inside the Server Action itself (not passed in from the client) and forwarded to the `/data` helper.
