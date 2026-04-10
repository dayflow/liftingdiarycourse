import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { format, parse } from 'date-fns'
import { getWorkoutsForDate } from '@/data/workouts'
import { DatePicker } from './DatePicker'
import { WorkoutCard } from './WorkoutCard'
import Link from 'next/link'

type Props = {
  searchParams: Promise<{ date?: string }>
}

export default async function DashboardPage({ searchParams }: Props) {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const { date: dateParam } = await searchParams
  const dateStr = dateParam ?? format(new Date(), 'yyyy-MM-dd')
  const date = parse(dateStr, 'yyyy-MM-dd', new Date())

  const workoutSessions = await getWorkoutsForDate(userId, dateStr)

  return (
    <main className="max-w-2xl mx-auto px-4 py-10 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <DatePicker selected={dateStr} />
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">
            Workouts for {format(date, 'do MMM yyyy')}
          </h2>
          <Link
            href="/dashboard/workout/new"
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            + Add workout
          </Link>
        </div>

        {workoutSessions.length === 0 ? (
          <p className="text-muted-foreground text-sm">No workouts logged for this date.</p>
        ) : (
          <div className="space-y-3">
            {workoutSessions.map((session) => (
              <WorkoutCard key={session.id} session={session} />
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
