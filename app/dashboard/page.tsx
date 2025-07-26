'use client'

import { useSession } from 'next-auth/react'

export default function DashboardPage() {
  const { data: session, status } = useSession()

  if (status === 'loading') return <p>Loading...</p>
  if (!session) return <p>You are not logged in.</p>

  return (
    <div className="min-h-screen p-6 flex flex-col items-center justify-center">
      <h1 className="text-2xl font-bold mb-2">Welcome, {session.user?.email}</h1>
      <p className="mb-4">
        Your current plan is: <strong>{session.user?.plan}</strong>
      </p>

      {session.user?.plan === 'PRO' ? (
        <div className="text-green-700">✅ You have access to PRO features!</div>
      ) : (
        <div className="text-yellow-600">⚠️ Upgrade to PRO to unlock full features.</div>
      )}
    </div>
  )
}
