'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { saveWorkout } from './actions'

type Props = {
  workoutId: number
  defaultDate: string
  defaultStartTime: string
  defaultEndTime: string
  defaultNotes: string
}

export function EditWorkoutForm({ workoutId, defaultDate, defaultStartTime, defaultEndTime, defaultNotes }: Props) {
  const router = useRouter()
  const [date, setDate] = useState<Date>(new Date(defaultDate))
  const [startTime, setStartTime] = useState(defaultStartTime)
  const [endTime, setEndTime] = useState(defaultEndTime)
  const [notes, setNotes] = useState(defaultNotes)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setPending(true)

    const [startHours, startMinutes] = startTime.split(':').map(Number)
    const startedAt = new Date(date)
    startedAt.setHours(startHours, startMinutes, 0, 0)

    let endedAt: Date | undefined
    if (endTime) {
      const [endHours, endMinutes] = endTime.split(':').map(Number)
      endedAt = new Date(date)
      endedAt.setHours(endHours, endMinutes, 0, 0)
    }

    try {
      const result = await saveWorkout({ workoutId, startedAt, endedAt, notes: notes || undefined })
      router.push(`/dashboard?date=${result.date}`)
    } catch {
      setError('Something went wrong. Please try again.')
      setPending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label>Date</Label>
        <Popover>
          <PopoverTrigger
            className={cn(buttonVariants({ variant: 'outline' }), 'w-full justify-start text-left font-normal')}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {format(date, 'do MMM yyyy')}
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(d) => d && setDate(d)}
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-2">
        <Label htmlFor="startTime">Start time</Label>
        <Input
          id="startTime"
          type="time"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="endTime">
          End time <span className="text-muted-foreground font-normal">(optional)</span>
        </Label>
        <Input
          id="endTime"
          type="time"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">
          Notes <span className="text-muted-foreground font-normal">(optional)</span>
        </Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g. Felt strong today, focused on form..."
          rows={3}
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? 'Saving...' : 'Save changes'}
        </Button>
        <Button type="button" variant="outline" onClick={() => history.back()}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
