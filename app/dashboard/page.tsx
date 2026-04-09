'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CalendarIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

// Placeholder workout type — replace with real type when data layer is added
type Workout = {
  id: string
  name: string
  sets: number
  reps: number
  weightKg: number
}

// Placeholder data — remove when real data fetching is wired up
const PLACEHOLDER_WORKOUTS: Workout[] = [
  { id: '1', name: 'Squat', sets: 4, reps: 5, weightKg: 100 },
  { id: '2', name: 'Bench Press', sets: 3, reps: 8, weightKg: 80 },
  { id: '3', name: 'Deadlift', sets: 1, reps: 5, weightKg: 140 },
]

export default function DashboardPage() {
  const [date, setDate] = useState<Date>(new Date())
  const [open, setOpen] = useState(false)

  const workouts = PLACEHOLDER_WORKOUTS

  return (
    <main className="max-w-2xl mx-auto px-4 py-10 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Dashboard</h1>

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger
            className={cn(buttonVariants({ variant: 'outline' }), 'gap-2')}
          >
            <CalendarIcon className="size-4" />
            {format(date, 'do MMM yyyy')}
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(d) => {
                if (d) {
                  setDate(d)
                  setOpen(false)
                }
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <section className="space-y-4">
        <h2 className="text-lg font-medium">
          Workouts for {format(date, 'do MMM yyyy')}
        </h2>

        {workouts.length === 0 ? (
          <p className="text-muted-foreground text-sm">No workouts logged for this date.</p>
        ) : (
          <div className="space-y-3">
            {workouts.map((workout) => (
              <Card key={workout.id}>
                <CardHeader className="pb-1">
                  <CardTitle className="text-base">{workout.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {workout.sets} sets &times; {workout.reps} reps &mdash; {workout.weightKg} kg
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
