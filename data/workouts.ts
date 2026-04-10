import { db } from '@/db'
import { workouts, workoutExercises, exerciseDefinitions } from '@/db/schema'
import { eq, and, gte, lt } from 'drizzle-orm'
import { startOfDay, endOfDay } from 'date-fns'

export type WorkoutWithExercises = {
  id: number
  startedAt: string
  endedAt: string | null
  notes: string | null
  exercises: {
    id: number
    orderIndex: number
    exerciseName: string
  }[]
}

export async function getWorkoutsForDate(
  userId: string,
  date: Date
): Promise<WorkoutWithExercises[]> {
  const rows = await db
    .select({
      workoutId: workouts.id,
      startedAt: workouts.startedAt,
      endedAt: workouts.endedAt,
      workoutNotes: workouts.notes,
      workoutExerciseId: workoutExercises.id,
      orderIndex: workoutExercises.orderIndex,
      exerciseName: exerciseDefinitions.name,
    })
    .from(workouts)
    .leftJoin(workoutExercises, eq(workoutExercises.workoutId, workouts.id))
    .leftJoin(
      exerciseDefinitions,
      eq(exerciseDefinitions.id, workoutExercises.exerciseDefinitionId)
    )
    .where(
      and(
        eq(workouts.userId, userId),
        gte(workouts.startedAt, startOfDay(date)),
        lt(workouts.startedAt, endOfDay(date))
      )
    )
    .orderBy(workouts.startedAt, workoutExercises.orderIndex)

  // Group flat rows into workouts with nested exercises
  const map = new Map<number, WorkoutWithExercises>()

  for (const row of rows) {
    if (!map.has(row.workoutId)) {
      map.set(row.workoutId, {
        id: row.workoutId,
        startedAt: row.startedAt.toISOString(),
        endedAt: row.endedAt ? row.endedAt.toISOString() : null,
        notes: row.workoutNotes,
        exercises: [],
      })
    }

    if (row.workoutExerciseId !== null && row.exerciseName !== null) {
      map.get(row.workoutId)!.exercises.push({
        id: row.workoutExerciseId,
        orderIndex: row.orderIndex ?? 0,
        exerciseName: row.exerciseName,
      })
    }
  }

  return Array.from(map.values())
}

export async function insertWorkout(
  userId: string,
  startedAt: Date,
  notes: string | null
) {
  const [workout] = await db
    .insert(workouts)
    .values({ userId, startedAt, notes })
    .returning({ id: workouts.id })
  return workout
}
