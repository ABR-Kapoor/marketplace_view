'use client'

import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export function RealtimeMedicines() {
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        const channel = supabase
            .channel('realtime-medicines')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'medicines',
                },
                (payload) => {
                    console.log('[Realtime] Database change detected:', payload.eventType)
                    router.refresh()
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [router, supabase])

    return null
}
