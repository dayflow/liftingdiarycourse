import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { NewWorkoutForm } from './NewWorkoutForm'

export default async function NewWorkoutPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const now = new Date()
  const defaultDate = now.toISOString()
  const defaultTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

  return (
    <main className="max-w-lg mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold mb-8">New workout</h1>
      <NewWorkoutForm defaultDate={defaultDate} defaultTime={defaultTime} />
    </main>
  )
}
