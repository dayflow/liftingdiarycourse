'use client'

import { parseISO, format } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { WorkoutWithExercises } from '@/data/workouts'

type Props = {
  session: WorkoutWithExercises
}

export function WorkoutCard({ session }: Props) {
  const startedAt = parseISO(session.startedAt)
  const endedAt = session.endedAt ? parseISO(session.endedAt) : null

  return (
    <Card>
      <CardHeader className="pb-1">
        <CardTitle className="text-base">
          {format(startedAt, 'h:mm a')}
          {endedAt && ` — ${format(endedAt, 'h:mm a')}`}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {session.exercises.length === 0 ? (
          <p className="text-sm text-muted-foreground">No exercises recorded.</p>
        ) : (
          <ul className="text-sm text-muted-foreground space-y-0.5">
            {session.exercises.map((ex) => (
              <li key={ex.id}>{ex.exerciseName}</li>
            ))}
          </ul>
        )}
        {session.notes && (
          <p className="mt-2 text-sm text-muted-foreground italic">{session.notes}</p>
        )}
      </CardContent>
    </Card>
  )
}
