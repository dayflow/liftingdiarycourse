'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { format, parse } from 'date-fns'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { buttonVariants } from '@/components/ui/button'
import { CalendarIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

type Props = {
  selected: string
}

export function DatePicker({ selected: selectedISO }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const selected = parse(selectedISO, 'yyyy-MM-dd', new Date())

  function handleSelect(d: Date | undefined) {
    if (!d) return
    setOpen(false)
    router.push(`/dashboard?date=${format(d, 'yyyy-MM-dd')}`)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className={cn(buttonVariants({ variant: 'outline' }), 'gap-2')}>
        <CalendarIcon className="size-4" />
        {format(selected, 'do MMM yyyy')}
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="end">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={handleSelect}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}
