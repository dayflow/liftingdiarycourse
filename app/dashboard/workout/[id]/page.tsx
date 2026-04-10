import { auth } from '@clerk/nextjs/server'
import { redirect, notFound } from 'next/navigation'
import { getWorkoutById } from '@/data/workouts'
import { EditWorkoutForm } from './EditWorkoutForm'

function toTimeString(date: Date) {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

export default async function EditWorkoutPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const workoutId = Number(id)
  if (!Number.isInteger(workoutId) || workoutId <= 0) notFound()

  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const workout = await getWorkoutById(userId, workoutId)
  if (!workout) notFound()

  const startedAt = new Date(workout.startedAt)
  const defaultDate = startedAt.toISOString()
  const defaultStartTime = toTimeString(startedAt)
  const defaultEndTime = workout.endedAt ? toTimeString(new Date(workout.endedAt)) : ''
  const defaultNotes = workout.notes ?? ''

  return (
    <main className="max-w-lg mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold mb-8">Edit workout</h1>
      <EditWorkoutForm
        workoutId={workout.id}
        defaultDate={defaultDate}
        defaultStartTime={defaultStartTime}
        defaultEndTime={defaultEndTime}
        defaultNotes={defaultNotes}
      />
    </main>
  )
}
