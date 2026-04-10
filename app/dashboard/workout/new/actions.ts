'use server'

import { z } from 'zod'
import { auth } from '@clerk/nextjs/server'
import { insertWorkout } from '@/data/workouts'

const createWorkoutSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startedAt: z.date(),
  endedAt: z.date().optional(),
  notes: z.string().optional(),
})

type CreateWorkoutInput = z.infer<typeof createWorkoutSchema>

export async function createWorkout(input: CreateWorkoutInput) {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthenticated')

  const parsed = createWorkoutSchema.safeParse(input)
  if (!parsed.success) {
    throw new Error('Invalid input')
  }

  const workout = await insertWorkout(
    userId,
    parsed.data.date,
    parsed.data.startedAt,
    parsed.data.endedAt ?? null,
    parsed.data.notes ?? null
  )

  return {
    date: parsed.data.date,
    workoutId: workout.id,
  }
}
