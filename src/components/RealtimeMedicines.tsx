'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

// Uses polling every 5 seconds to detect medicine inventory changes.
// Replaces the old Supabase postgres_changes realtime subscription
// since Nhost Postgres doesn't use the Supabase Realtime protocol.
// For true push-based realtime, Hasura GraphQL Subscriptions can be
// configured here in the future using graphql-ws.

export function RealtimeMedicines() {
    const router = useRouter()

    useEffect(() => {
        // Poll every 5 seconds to keep medicine list fresh
        const interval = setInterval(() => {
            router.refresh()
        }, 5000)

        return () => clearInterval(interval)
    }, [router])

    return null
}
