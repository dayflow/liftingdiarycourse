'use server'

import { z } from 'zod'
import { auth } from '@clerk/nextjs/server'
import { insertWorkout } from '@/data/workouts'

const createWorkoutSchema = z.object({
  startedAt: z.date(),
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
    parsed.data.startedAt,
    parsed.data.notes ?? null
  )

  return {
    date: parsed.data.startedAt.toISOString().split('T')[0],
    workoutId: workout.id,
  }
}
