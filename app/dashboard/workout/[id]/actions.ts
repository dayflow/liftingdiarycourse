'use server'

import { z } from 'zod'
import { auth } from '@clerk/nextjs/server'
import { updateWorkout } from '@/data/workouts'

const updateWorkoutSchema = z.object({
  workoutId: z.number().int().positive(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startedAt: z.date(),
  endedAt: z.date().optional(),
  notes: z.string().optional(),
})

type UpdateWorkoutInput = z.infer<typeof updateWorkoutSchema>

export async function saveWorkout(input: UpdateWorkoutInput) {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthenticated')

  const parsed = updateWorkoutSchema.safeParse(input)
  if (!parsed.success) throw new Error('Invalid input')

  await updateWorkout(
    userId,
    parsed.data.workoutId,
    parsed.data.date,
    parsed.data.startedAt,
    parsed.data.endedAt ?? null,
    parsed.data.notes ?? null
  )

  return { date: parsed.data.date }
}
