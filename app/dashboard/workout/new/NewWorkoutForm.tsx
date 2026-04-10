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
import { createWorkout } from './actions'

type Props = {
  defaultDate: string
  defaultTime: string
}

export function NewWorkoutForm({ defaultDate, defaultTime }: Props) {
  const router = useRouter()
  const [date, setDate] = useState<Date>(new Date(defaultDate))
  const [time, setTime] = useState(defaultTime)
  const [notes, setNotes] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setPending(true)

    const [hours, minutes] = time.split(':').map(Number)
    const startedAt = new Date(date)
    startedAt.setHours(hours, minutes, 0, 0)

    try {
      const result = await createWorkout({ startedAt, notes: notes || undefined })
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
        <Label htmlFor="time">Start time</Label>
        <Input
          id="time"
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes <span className="text-muted-foreground font-normal">(optional)</span></Label>
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
          {pending ? 'Creating...' : 'Create workout'}
        </Button>
        <Button type="button" variant="outline" onClick={() => history.back()}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
